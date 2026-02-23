import { ItemService } from "src/master/barang/item/item.service";
import { InventoryRepository } from "./inventory.repository";
import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { InventoryDTO, InventoryManyPayload, InventoryOrderByField, InventoryQueryOptionsDTO, InventoryResponse } from "./dto/inventory.model";
import { InvntoryTransactionType, Prisma, TipePemberitahuan } from "@prisma/client";
import { UpsertNotificationDTO } from "src/notification/notification.model";
import { NotificationService } from "src/notification/notification.service";

@Injectable()
export class InventoryService {
    private readonly ctx = 'InventoryService';
    constructor(
        private readonly repo: InventoryRepository,
        private readonly notificationService: NotificationService,
        @Inject(forwardRef(() => ItemService)) private itemService: any,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {}

    private toInventoryResponse(inventory: any): InventoryResponse {
        return {
            id: inventory.id,
            item: inventory.item,
            stok: inventory.stok,
            tanggal_terima: inventory.tanggal_terima,
            expired_date: inventory.expired_date,
            status: inventory.status,
            transaction_type: inventory.transaction_type
        }
    }

    async inventoryMustExists(
        id: number
    ): Promise<InventoryResponse> {
        this.logger.debug(`Searching inventory with id: ${id}`,{context: this.ctx});
        const data = await this.repo.findById(id);

        if(!data){
            this.logger.warn(`inventory with id: ${id} is not found`,{context: this.ctx});
            throw new HttpException('inventory not found', HttpStatus.NOT_FOUND);
        }

        return this.toInventoryResponse(data)
    }

    async createInventory(
        data: InventoryDTO
    ): Promise<InventoryResponse>{
        this.logger.info(`starting create inventory with idItem item: ${data.itemId}`, {context: this.ctx});
        const item = await this.itemService.itemMustExists(data.itemId);
        
        data.itemId = item.id;
        const newInventory = await this.repo.create(data);
        this.logger.info('creating inventory success', {context: this.ctx});
        return this.toInventoryResponse(newInventory);
    }

    async createInventoryMany(
        data: InventoryDTO[],
        tx?: Prisma.TransactionClient
    ): Promise<InventoryManyPayload> {
        this.logger.info('create many inventory',{context: this.ctx});
        return await this.repo.createMany(data, tx);
    }

    async removeInventory(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<InventoryResponse>{
        this.logger.info(`starting remove data inventory with id: ${id}`,{context: this.ctx});
        const currentData = await this.inventoryMustExists(id);

        const inventoryRemoved = await this.repo.remove(currentData.id, tx);
        this.logger.info(`data inventory with id: ${inventoryRemoved.id} was removed successfully`,{context: this.ctx});
        return this.toInventoryResponse(inventoryRemoved);
    }

    async getAll(
        queryOptions: InventoryQueryOptionsDTO
    ): Promise<{
        data: InventoryResponse[],
        meta: any
    }>{
        this.logger.debug('Get All data Inventory with dynamic options',{context: this.ctx});
        const { page, pageSize, keyword, orderByField, orderByDirection } = queryOptions;
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const direction = orderByDirection === -1 ? 'desc' : 'asc';
        let orderBy: Prisma.InventoryOrderByWithRelationInput;
        
        if(orderByField === InventoryOrderByField.ITEM){
            orderBy = {
                item: {
                    nama_item: direction
                }
            }
        } else {
            orderBy = {
                [orderByField]: direction
            }
        }

        const conditions: Prisma.InventoryWhereInput[] = [
            { deleted_at: null }
        ];

        if(keyword && keyword.trim() !== ''){
            conditions.push({
                OR: [
                    { item: { nama_item: { contains: keyword, mode: 'insensitive' } } },
                    { item: { sku: { contains: keyword, mode: 'insensitive' } } }
                ]
            })
        }

        const where: Prisma.InventoryWhereInput = {
            AND: conditions
        }

        const [listData, totalItem] = await Promise.all([
            this.repo.findAll({
                where: where,
                take: take,
                skip: skip,
                orderBy: orderBy
            }),
            this.repo.countAll(where),
        ]);

        if(listData.length === 0){
            return {
                data: [],
                meta: {
                    totalItem: 0,
                    totalPage: 0,
                    currentPage: 1
                }
            }
        }

        const totalPage = Math.ceil(totalItem/pageSize);
        return {
            data: listData.map((item) => this.toInventoryResponse(item)),
            meta: {
                totalItem: totalItem,
                totalPage: totalPage,
                currentPage: page
            }
        }
    }

    async getBySku(
        sku: string
    ): Promise<InventoryResponse[]>{
        this.logger.info(`Get All data inventory by sku item: ${sku}`,{context: this.ctx});
        const listData = await this.repo.findBySku(sku);
        
        return listData.map((item) => this.toInventoryResponse(item));
    }

    async getStokBySkus(itemIds: number[]): Promise<Map<number, number>> {
        this.logger.debug(`Fetching stok sums for ${itemIds.length} Item Ids`,{context: this.ctx});
        
        const stokSumRaw = await this.repo.sumStokBySkus(itemIds);
        
        const stokMap = new Map<number, number>();
        for(const s of stokSumRaw){
            stokMap.set(s.itemId, Number(s.total_stok) || 0);
        }

        return stokMap;
    }

    async getByItemAndTanggal(
        itemId: number,
        tanggal: Date,
        tx?: Prisma.TransactionClient
    ): Promise<InventoryResponse> {
        this.logger.debug(`Searching data inventory with item id: ${itemId} and tanggal: ${tanggal}`,{context: this.ctx});
        const data = await this.repo.findByItemIdAndTanggal(itemId, tanggal, tx);
        if(!data){
            this.logger.warn(`data inventory with itemId: ${itemId} and tanggal: ${tanggal}, is not found`, {context: this.ctx});
            throw new HttpException('Data inventory is not found!', HttpStatus.NOT_FOUND);
        }

        return this.toInventoryResponse(data);
    }

    async reducingStok(
        itemId: number,
        quantityReduce: number,
        tx?: Prisma.TransactionClient
    ): Promise<void>{
        this.logger.info(`starting reducing stok for item with id: ${itemId}, quantity: ${quantityReduce}`, {context: this.ctx});
        
        const inventoryItem = await this.repo.findAndLockOneByItemId(itemId, quantityReduce, tx);
        
        if(!inventoryItem){
            this.logger.warn(`no stock available for item ID: ${itemId}`,{context: this.ctx});
            throw new HttpException('Stok tidak di temukan untuk item ini', HttpStatus.NOT_FOUND);
        }

        if(inventoryItem.stok < quantityReduce){
            this.logger.warn(`Not enough stok in seleted batch for item ID: ${itemId}`,{context: this.ctx});
            throw new HttpException(`Stok pada batch yang di pilih tidak mencukupi, sisa: ${inventoryItem.stok}`, HttpStatus.BAD_REQUEST);
        }

        const newStok = inventoryItem.stok - quantityReduce;
        await this.repo.updateStok(inventoryItem.id, newStok, tx);

        this.logger.info(`Successfully reduced stock for inventory ID: ${inventoryItem.id}, new stok: ${newStok}`,{context: this.ctx})
    }

    async changeStatusByExpired(): Promise<void> {
        try {
            const now = new Date()
            // notification context
            const where: Prisma.InventoryWhereInput = {
                AND: [
                    {
                        expired_date: {
                            lte: now
                        }
                    },
                    {
                        status: true
                    },
                    {
                        stok: {
                            gt: 0
                        }
                    }
                ]
            }

            const inventoryExpiredRaw = await this.repo.findAll({
                where: where
            });
            const inventoryExpired = inventoryExpiredRaw.map((item) => this.toInventoryResponse(item))
            for (const inv of inventoryExpired) {
                const tanggalExpired = inv.expired_date?.toISOString().split('T')[0];
                const pesan = `Product ${inv.item?.nama_item} (SKU: ${inv.item?.sku}) telah Kadaluarsa ${tanggalExpired} sebanyak ${inv.stok}`;
                
                const notifSender: UpsertNotificationDTO = {
                    tipe: TipePemberitahuan.ITEM_EXPIRED,
                    pesan: pesan,
                    refrensiId: inv.id
                }

                await this.notificationService.createNotification(notifSender);
            }
            const result = await this.repo.changeStatusByExpired();

            if(result.count > 0){
                this.logger.info(`successfully deactive ${result.count} inventory expired item`,{context: this.ctx});
            } else {
                this.logger.info('no expired item found to deactivate',{context: this.ctx});
            }
        } catch (err){
            this.logger.error('failed to expired "check expired inventory item" cron job',{context: this.ctx, error: err.stack});
        }
    }

    async adjustmentStok(
        itemId: number,
        adjustmentQty: number,
        tx?: Prisma.TransactionClient
    ): Promise<void> {
        this.logger.info(`adjustment stok for itemId ${itemId}, qty: ${adjustmentQty}`,{context: this.ctx});
        if(adjustmentQty > 0){
            await this.repo.create({
                itemId: itemId,
                stok: adjustmentQty,
                tanggal_terima: new Date(),
                transaction_type: InvntoryTransactionType.PENYESUAIAN_STOK,
            }, tx);
        } else if (adjustmentQty < 0){
            let sisaPengurangan = Math.abs(adjustmentQty);
            while (sisaPengurangan > 0){
                const inventoryItem = await this.repo.findAndLockOneByItemId(itemId, sisaPengurangan, tx);
                if (!inventoryItem){
                    this.logger.debug(`stok in inventory not enough for adjustment stok to itemId: ${itemId}`,{context: this.ctx});
                    throw new HttpException('Stok di sistem tidak mencukupi untuk penyesuaian stok', HttpStatus.CONFLICT);
                }

                const stokInBatch = inventoryItem.stok;
                const qtyAdj = Math.min(sisaPengurangan, stokInBatch);
                await this.repo.updateStok(inventoryItem.id, stokInBatch - qtyAdj, tx);
                sisaPengurangan -= qtyAdj;
            }
        }
    }
}