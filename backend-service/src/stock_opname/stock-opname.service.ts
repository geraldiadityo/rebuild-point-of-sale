import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { PrismaService } from "src/common/prisma.service";
import { InventoryService } from "src/inventory/inventory.service";
import { ItemService } from "src/master/barang/item/item.service";
import { Logger } from "winston";
import { StokOpnameRepository } from "./stock-opname.repository";
import { FullStokOpnameResponse, StokOpnameDetailResponse, StokOpnameQueryOption, StokOpnameResponse } from "./dto/stock-opname.model";
import { Prisma, StokOpnameStatus } from "@prisma/client";

@Injectable()
export class StokOpnameService {
    private readonly ctx = 'StokOpnameService';
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly prisma: PrismaService,
        private readonly inventoryService: InventoryService,
        private readonly itemService: ItemService,
        private readonly repo: StokOpnameRepository
    ) {}

    private toStokOpnameResponse(opname: any): StokOpnameResponse {
        return {
            id: opname.id,
            tanggal_mulai: opname.tanggal_mulai,
            tanggal_selesai: opname.tanggal_selesai,
            status: opname.status,
            catatan: opname.catatan,
            pengguna: opname.pengguna
        }
    }

    private toStokOpnameDetailResponse(detail: any): StokOpnameDetailResponse {
        return {
            id: detail.id,
            opnameId: detail.opnameId,
            stock_system: detail.stock_system,
            stock_real: detail.stock_real,
            selisih: detail.selisih,
            item: detail.item
        }
    }

    private toFullStokOpnameResponse(opname: any): FullStokOpnameResponse {
        const header = this.toStokOpnameResponse(opname);
        const detail = opname.Stok_opname_detail.map((item) => this.toStokOpnameDetailResponse(item))

        return {
            ...header,
            Stok_opname_detail: detail
        }
    }

    async stokOpnameMustExist(
        id: number
    ): Promise<StokOpnameResponse> {
        this.logger.debug(`searching stok opanem with id: ${id}`,{context: this.ctx});
        const data = await this.repo.findById(id);

        if(!data){
            this.logger.warn(`stok opanem with id: ${id} is not found`,{context: this.ctx});
            throw new HttpException('stok opname is not found', HttpStatus.NOT_FOUND);
        }

        return this.toStokOpnameResponse(data);
    }

    async startOpname(
        penggunaId: number,
        catatan?: string,
    ): Promise<StokOpnameResponse> {
        this.logger.info(`starting session stok opname with pengguna id: ${penggunaId}`,{context: this.ctx});
        const allItems = await this.itemService.getAllWithoutMeta();
        const itemIds = allItems.map((item) => item.id);
        const stokMap = await this.inventoryService.getStokBySkus(itemIds);
        
        const newSession = await this.prisma.$transaction(
            async (tx) => {
                const sessionOpname = await this.repo.createSessionOpname({
                    penggunaId: penggunaId,
                    catatan: catatan,
                    tanggal_mulai: new Date(),
                    status: StokOpnameStatus.BERJALAN,
                }, tx);

                const detailToCreate = allItems.map((item) => ({
                    opnameId: sessionOpname.id,
                    itemId: item.id,
                    stock_system: stokMap.get(item.id) || 0
                }));

                if(detailToCreate.length > 0){
                    await this.repo.createManyDetail(detailToCreate, tx);

                }

                return sessionOpname;
            }
        );

        return this.toStokOpnameResponse(newSession);
    }

    async submitCounts(
        opnameId: number,
        counts: { itemId: number, stock_real: number }[]
    ): Promise<void> {
        this.logger.info(`saving data counts for opname id :${opnameId}`,{context: this.ctx});
        const session = await this.stokOpnameMustExist(opnameId);
        if(session && session.status !== StokOpnameStatus.BERJALAN){
            this.logger.warn('Session stok opname sudah selesai atau telah di batalkan',{context: this.ctx});
            throw new HttpException('Session Stok opanem telah selesai atau telah di batalkan', HttpStatus.BAD_REQUEST);
        }

        await this.prisma.$transaction(
            async (tx) => {
                for(const count of counts) {
                    await this.repo.updateDetailCount(opnameId, count.itemId, count.stock_real, tx);
                }
            }
        )
    }

    // final stok opname (create adjustment stok from inventory)
    async finishOpname(
        opnameId: number
    ): Promise<StokOpnameResponse>{
        this.logger.info(`Finish and adjustment stok for opnameId: ${opnameId}`,{context: this.ctx});
        const finishedSession = await this.prisma.$transaction(
            async (tx) => {
                const session = await this.stokOpnameMustExist(opnameId);
                if(session.status !== StokOpnameStatus.BERJALAN){
                    this.logger.warn(`stop opname with id: ${opnameId} is not found for has finished`,{context: this.ctx});
                    throw new HttpException('Stok opname not found or has finished', HttpStatus.BAD_REQUEST);
                }

                const discrepancies = await this.repo.findDiscrepancies(opnameId, tx);
                this.logger.debug(`found item with discrepancies ${discrepancies.length} to adjustment stok`,{context: this.ctx});
                
                for(const detail of discrepancies){
                    if(detail.selisih !== 0 || detail.selisih !== null){
                        await this.inventoryService.adjustmentStok(detail.itemId, detail.selisih ? detail.selisih : 0, tx)
                    }
                }
                return await this.repo.updateSesiStatus(opnameId, StokOpnameStatus.SELESAI, tx);
            }
        )

        return this.toStokOpnameResponse(finishedSession);
    }


    async getAll(
        queryOption: StokOpnameQueryOption
    ): Promise<{
        data: StokOpnameResponse[],
        meta: any
    }>{
        this.logger.debug('get all data stok opname with dynamic query',{context: this.ctx});
        const { page, pageSize, orderByField, orderByDirection } = queryOption;
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const directions = orderByDirection === -1 ? 'desc' : 'asc';
        const orderBy: Prisma.Stok_opnameOrderByWithRelationInput = {
            [orderByField]: directions
        };

        const [listData, totalItem] = await Promise.all([
            this.repo.findAll({
                orderBy: orderBy,
                take: take,
                skip: skip
            }),
            this.repo.count()
        ]);

        if(listData.length === 0){
            return {
                data: [],
                meta: {
                    totalItem: 0,
                    totalPage: 0,
                    currentPage: 1,
                }
            }
        }

        const totalPage = Math.ceil(totalItem/pageSize);
        return {
            data: listData.map((item) => this.toStokOpnameResponse(item)),
            meta: {
                totalItem: totalItem,
                totalPage: totalPage,
                currentPage: page
            }
        }
    }

    async getFullDetailById(
        id: number
    ): Promise<FullStokOpnameResponse>{
        this.logger.debug(`get full data by stok opname id`,{context: this.ctx});
        const currentData = await this.stokOpnameMustExist(id);

        const data = await this.repo.findFullDetailById(currentData.id);
        // console.log(data);

        return this.toFullStokOpnameResponse(data);
    }
}