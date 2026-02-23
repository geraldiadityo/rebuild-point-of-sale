import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { CashRepository } from "./cash.repository";
import { CashCreateDTO, CashMutationCreateDTO, CashMutationDTO, CashMutationQueryOptionDTO, CashMutationResponse, CashResponse } from "./cash.model";
import { Cash, Prisma } from "@prisma/client";
import { RCashMutationQuery, RShiftCashMutationQuery } from "src/reporting/dto/reporting.model";

@Injectable()
export class CashService {
    private readonly ctx = 'CashService';
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly repo: CashRepository
    ) {}

    private toCashResponse(cash: Cash): CashResponse {
        return {
            id: cash.id,
            cash_name: cash.cash_name,
            values: cash.values
        }
    }

    private toCashMutationResponse(data: any): CashMutationResponse {
        return {
            id: data.id,
            cash: data.cash,
            saldo_awal: data.saldo_awal,
            type: data.type,
            keterangan: data.keterangan,
            value: data.value,
            saldo_akhir: data.saldo_akhir,
            tanggal: data.tanggal,
            pengguna: data.pengguna,
            shift: data.shift,
        }
    }

    private async checkCashName(
        cash_name: string
    ): Promise<CashResponse | null>{
        this.logger.debug(`starting search cash with name: ${cash_name}`,{context: this.ctx});
        const data = await this.repo.getByName(cash_name);
        if(!data){
            return null
        }

        return this.toCashResponse(data);
    }

    async cashMustExist(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<CashResponse> {
        this.logger.debug(`starting search cash with id: ${id}`,{context: this.ctx});
        const data = await this.repo.getById(id, tx);

        if(!data){
            this.logger.warn(`cash with id: ${id} is not found`,{context: this.ctx});
            throw new HttpException('Cash Not Found', HttpStatus.NOT_FOUND);
        }

        return this.toCashResponse(data)
    }

    async create(
        data: CashCreateDTO
    ): Promise<CashResponse> {
        this.logger.info(`starting create new cash with name: ${data.cash_name}`,{context: this.ctx});
        const checkName = await this.checkCashName(data.cash_name);
        if(checkName){
            this.logger.warn(`cash with name: ${data.cash_name} was already exists`, {context: this.ctx});
            throw new HttpException('Cash name has already exists', HttpStatus.BAD_REQUEST);
        }
        const newCash = await this.repo.create(data);
        this.logger.info(`create new cash with id: ${newCash.id} and name: ${newCash.cash_name} was successfully`,{context: this.ctx});
        
        return this.toCashResponse(newCash);
    }

    async update(
        id: number,
        data: CashCreateDTO
    ): Promise<CashResponse> {
        this.logger.info(`starting update cash with id: ${id}`, {context: this.ctx});
        const currentData = await this.cashMustExist(id);
        if(data.cash_name !== currentData.cash_name){
            const checkName = await this.checkCashName(data.cash_name);
            if(checkName){
                this.logger.warn(`cash with name: ${data.cash_name} has already exists`, {context: this.ctx});
                throw new HttpException('Cash name already exists', HttpStatus.BAD_REQUEST);
            }
        }

        const updatedCash = await this.repo.update(currentData.id, data);
        this.logger.info(`update data cash with id: ${updatedCash.id} was successfully`, {context: this.ctx});
        return this.toCashResponse(updatedCash);
    }

    async increaseCash(
        id: number,
        values: number,
        tx?: Prisma.TransactionClient
    ): Promise<CashResponse> {
        this.logger.info(`starting increase cash value`,{context: this.ctx});
        const currentData = await this.cashMustExist(id,tx);
        const newValues = currentData.values + values;
        const updatedValues = await this.repo.update(currentData.id, {values: newValues}, tx);
        this.logger.info(`successfully increase cash value`,{context: this.ctx});
        return this.toCashResponse(updatedValues);
    }

    async decreaseCash(
        id: number,
        values: number,
        tx?: Prisma.TransactionClient
    ): Promise<CashResponse> {
        this.logger.info(`starting decrease cash value`,{context: this.ctx});
        const currentData = await this.cashMustExist(id, tx);
        console.log(currentData.values);
        console.log(values);
        const newValues = currentData.values - values;
        console.log(newValues)
        const updatedValues = await this.repo.update(currentData.id, {values: newValues}, tx);
        this.logger.info('successfully decrease cash value',{context: this.ctx});
        
        return this.toCashResponse(updatedValues);
    };

    async createMutationCash(
        data: CashMutationDTO,
        tx?: Prisma.TransactionClient
    ): Promise<CashMutationResponse> {
        this.logger.info(`starting create mutation cash with cashId: ${data.cashId}`,{context: this.ctx});
        const result = await this.repo.createCashMutation(data, tx);
        this.logger.info(`successfully create new cash mutation in cash id: ${data.cashId}`,{context: this.ctx});
        return this.toCashMutationResponse(result);
    }

    async getCashMutation(
        cashId: number,
        queryOption: CashMutationQueryOptionDTO
    ): Promise<{
        data: CashMutationResponse[],
        meta: any
    }> {
        this.logger.debug(`Get all data Cash mutation with cash id: ${cashId}`, {context: this.ctx});
        const { page, pageSize, keyword, orderByField, orderByDirection } = queryOption;

        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const direction = orderByDirection === -1 ? 'desc' : 'asc';
        const orderBy: Prisma.Cash_mutationOrderByWithRelationInput = {
            [orderByField]: direction
        };

        const conditions: Prisma.Cash_mutationWhereInput[] = [
            { cashId: cashId }
        ];

        if(keyword && keyword.trim() !== ''){
            conditions.push({
                OR: [
                    { keterangan: { contains: keyword, mode: 'insensitive' } }
                ]
            })
        }

        const where: Prisma.Cash_mutationWhereInput = {
            AND: conditions
        };

        const [listData, totalItem] = await Promise.all([
            this.repo.cashMutationFindAll({
                where: where,
                orderBy: orderBy,
                take: take,
                skip: skip

            }),
            this.repo.cashMutationCount(where)
        ]);

        if(listData.length === 0){
            return {
                data: [],
                meta: {
                    totalItem: 0,
                    totalPage: 0,
                    currentPage: page
                }
            }
        }

        const totalPage = Math.ceil(totalItem/pageSize);
        
        return {
            data: listData.map((item) => this.toCashMutationResponse(item)),
            meta: {
                totalItem: totalItem,
                totalPage: totalPage,
                currentPage: page
            }
        }
    }

    async getAll(): Promise<CashResponse[]> {
        const listData = await this.repo.getAll();

        return listData.map((item) => this.toCashResponse(item));
    }

    async removeCash(
        id: number
    ): Promise<CashResponse> {
        this.logger.info(`starting delete cash data with id: ${id}`,{context: this.ctx});
        const currentData = await this.cashMustExist(id);

        const removedCash = await this.repo.remove(currentData.id);

        return this.toCashResponse(removedCash);
    }

    async getCashMutationForReporting(
        cashId: number,
        queryOption: RCashMutationQuery
    ): Promise<CashMutationResponse[]>{
        this.logger.debug(`get cash mutation with cash id: ${cashId} with dynamic query for reporting`,{context: this.ctx});
        
        const { startDate, endDate } = queryOption;

        const conditions: Prisma.Cash_mutationWhereInput[] = [
            { cashId: cashId }
        ];

        const orderBy: Prisma.Cash_mutationOrderByWithRelationInput = {
            ['tanggal']: 'asc'
        };

        if((startDate && startDate.trim() !== '') && (endDate && endDate.trim() !== '')){
            const start = new Date(startDate);
            const end = new Date(endDate);

            conditions.push({
                tanggal: {
                    gte: start,
                    lte: end
                }
            });
        }

        const where: Prisma.Cash_mutationWhereInput = {
            AND: conditions
        };

        const listData = await this.repo.cashMutationFindAll({where: where, orderBy: orderBy});

        return listData.map((item) => this.toCashMutationResponse(item));
    }

    async getCashMutationForShiftReporting(
        query: RShiftCashMutationQuery,
        cashId: number,
    ): Promise<CashMutationResponse[]>{
        this.logger.debug('starting get cash Mutation for Shift reporting', {context: this.ctx});
        const { startDate, endDate, penggunaId, shift } = query;
        // console.log(query);
        // console.log(cashId)

        const orderBy: Prisma.Cash_mutationOrderByWithRelationInput = {
            ['tanggal']: 'asc'
        };

        const condition: Prisma.Cash_mutationWhereInput[] = [
            {cashId: cashId}
        ];

        if(penggunaId){
            condition.push({
                penggunaId: penggunaId
            })
        }

        if(shift && shift.trim() !== ''){
            condition.push({
                shift: shift
            })
        };

        if((startDate && startDate.trim() !== '') && (endDate && endDate.trim() !== '')){
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999)

            condition.push({
                tanggal: {
                    gte: start,
                    lte: end
                }
            });
        }

        const where: Prisma.Cash_mutationWhereInput = {
            AND: condition
        };

        const listData = await this.repo.cashMutationFindAll({where: where, orderBy: orderBy});
        // console.log(listData);

        return listData.map((item) => this.toCashMutationResponse(item));
    }
}