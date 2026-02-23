import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { SupplierRepository } from "./supplier.repository";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { SupplierDTO, SupplierQueryOptionDTO, SupplierResponse } from "./dto/supplier.model";
import { Prisma, Supplier } from "@prisma/client";

@Injectable()
export class SupplierService {
    private readonly ctx = 'SupplierService';
    constructor(
        private readonly repo: SupplierRepository,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {}

    private toSupplierResponse(supplier: Supplier): SupplierResponse {
        return {
            id: supplier.id,
            nama_supplier: supplier.nama_supplier,
            alamat: supplier.alamat,
            no_telp: supplier.no_telp,
            deskripsi: supplier.deskripsi
        }
    }

    async supplierMustExists(
        id: number
    ): Promise<SupplierResponse>{
        this.logger.debug(`searching supplier with id: ${id}`,{context: this.ctx});
        const data = await this.repo.findById(id);
        
        if(!data){
            this.logger.warn(`data supplier with id: ${id} is not found`,{context: this.ctx});
            throw new HttpException('Supplier not found', HttpStatus.NOT_FOUND);
        }

        return this.toSupplierResponse(data)
    }

    async checkName(
        nama_supplier: string
    ): Promise<SupplierResponse | null>{
        this.logger.debug(`Searching supplier with name: ${nama_supplier}`,{context: this.ctx});
        const data = await this.repo.findByName(nama_supplier);
        
        if(!data){
            this.logger.warn(`data supplier with name: ${nama_supplier} is not found!`,{context: this.ctx});
            return null
        }

        return this.toSupplierResponse(data)
    }

    async createSupplier(
        data: SupplierDTO
    ): Promise<SupplierResponse>{
        this.logger.info(`Starting creating supplier with name: ${data.nama_supplier}`,{context: this.ctx});
        const checkName = await this.checkName(data.nama_supplier);
        if(checkName){
            this.logger.warn(`supplier with name: ${data.nama_supplier} has already exists`,{context: this.ctx});
            throw new HttpException('Supplier has already exists', HttpStatus.BAD_REQUEST);
        }

        const newSupplier = await this.repo.create(data);
        this.logger.info(`Supplier with name: ${newSupplier.nama_supplier} was created successfully`,{context: this.ctx});
        return this.toSupplierResponse(newSupplier);
    }

    async updateSupplier(
        id: number,
        data: SupplierDTO
    ): Promise<SupplierResponse>{
        this.logger.info(`Starting updated supplier with id: ${id}`,{context: this.ctx});
        const currentData = await this.supplierMustExists(id);
        
        if(data.nama_supplier !== currentData.nama_supplier){
            const checkName = await this.checkName(data.nama_supplier);
            if(checkName){
                this.logger.warn(`Supplier with name: ${data.nama_supplier} has already exists`,{context: this.ctx});
                throw new HttpException('Supplier has already exists', HttpStatus.BAD_REQUEST);
            }
        }

        const updatedSupplier = await this.repo.update(currentData.id, data);
        this.logger.info(`Supplier with id: ${currentData.id} was updated successfully`,{context: this.ctx});
        return this.toSupplierResponse(updatedSupplier);
    }

    async removeSupplier(
        id: number
    ): Promise<SupplierResponse>{
        this.logger.info(`Starting remove supplier with id: ${id}`,{context: this.ctx});
        const currentData = await this.supplierMustExists(id);

        const deletedSupplier = await this.repo.delete(currentData.id);
        this.logger.info(`Supplier with id: ${id} was deleted successfully`,{context: this.ctx});
        return this.toSupplierResponse(deletedSupplier);
    }

    async getAll(
        queryOption: SupplierQueryOptionDTO
    ): Promise<{
        data: SupplierResponse[],
        meta: any
    }>{
        this.logger.debug('Get All data supplier with dynamic options',{context: this.ctx});
        const { page, pageSize, keyword, orderByField, orderByDirection } = queryOption;
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const direction = orderByDirection === -1 ? 'desc' : 'asc';
        const orderBy: Prisma.SupplierOrderByWithRelationInput = {
            [orderByField]: direction
        }

        const where: Prisma.SupplierWhereInput = keyword && keyword.trim() !== '' ? {
            OR: [
                { nama_supplier: { contains: keyword, mode: 'insensitive' } },
                { alamat: { contains: keyword, mode: 'insensitive' } }
            ]
        } : {};

        const [listData, totalItem] = await Promise.all([
            this.repo.findAll({
                where,
                orderBy,
                take,
                skip,
            }),
            this.repo.countAll(where)
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
            data: listData.map((item) => this.toSupplierResponse(item)),
            meta: {
                totalItem: totalItem,
                totalPage: totalPage,
                currentPage: page
            }
        }
    }

    async findOrCreate(
        data: SupplierDTO,
        tx?: Prisma.TransactionClient
    ): Promise<SupplierResponse>{
        this.logger.debug(`Searching supplier with name: ${data.nama_supplier}`,{context: this.ctx});
        const existing = await this.checkName(data.nama_supplier);
        
        if(existing){
            this.logger.debug(`Supplier with name: ${data.nama_supplier} are existing`,{context: this.ctx});
            return this.toSupplierResponse(existing);
        }
        this.logger.info(`starting supplier created`,{context: this.ctx});
        const supplier = await this.repo.upsert(data, tx);

        this.logger.info('create data supplier was success',{context: this.ctx});
        return this.toSupplierResponse(supplier);
    }
}