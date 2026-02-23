import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ItemSatuanRepository } from "./item_satuan.repository";
import { SatuanService } from "../satuan/satuan.service";
import { ItemService } from "../item/item.service";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { ItemSatuanRequest, ItemSatuanResponse } from "./dto/item_satuan.model";
import { Prisma } from "@prisma/client";

@Injectable()
export class ItemSatuanService {
    private readonly ctx = 'ItemSatuanService';
    constructor(
        private readonly repo: ItemSatuanRepository,
        private satuanService: SatuanService,
        private itemService: ItemService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {}

    private toItemSatuanResponse(item_satuan: any): ItemSatuanResponse {
        return {
            id: item_satuan.id,
            item: item_satuan.item,
            satuan: item_satuan.satuan,
            convert_item: item_satuan.convert_item,
            qty_price: item_satuan.qty_price
        }
    }

    async itemSatuanMustExists(
        id: number
    ): Promise<ItemSatuanResponse> {
        this.logger.debug(`Searching item satuan with id: ${id}`, {context: this.ctx});
        const data = await this.repo.findById(id);

        if(!data){
            this.logger.warn(`item satuan with id: ${id} is not found!`, {context: this.ctx});
            throw new HttpException('item satuan not found', HttpStatus.NOT_FOUND);
        }

        return this.toItemSatuanResponse(data);
    }

    async createItemSatuan(
        data: ItemSatuanRequest
    ): Promise<ItemSatuanResponse> {
        this.logger.info('starting create item satuan', {context: this.ctx});
        const item = await this.itemService.itemMustExists(data.itemId);
        const satuan = await this.satuanService.satuanMustExist(data.satuanId);
        
        data.itemId = item.id,
        data.satuanId = satuan.id;

        const newItemSatuan = await this.repo.create(data);

        this.logger.info('item satuan was created successfully',{context: this.ctx});
        return this.toItemSatuanResponse(newItemSatuan);
    }

    async findOrCreate(
        data: ItemSatuanRequest,
        tx?: Prisma.TransactionClient
    ): Promise<ItemSatuanResponse>{
        this.logger.debug(`Search item satuan with itemId: ${data.itemId} and satuanId: ${data.satuanId}`,{context: this.ctx});
        const exists = await this.repo.findByItemAndSatuan(data.itemId, data.satuanId);
        
        if(exists){
            this.logger.info(`item satuan with itemid: ${data.itemId} and satuanId: ${data.satuanId} was founded`,{context: this.ctx});
            return this.toItemSatuanResponse(exists);
        }

        this.logger.info(`starting create new item satuan`,{context: this.ctx});
        const item = await this.itemService.itemMustExists(data.itemId, tx);
        const satuan = await this.satuanService.satuanMustExist(data.satuanId);
        const dataSender: ItemSatuanRequest = {
            itemId: item.id,
            satuanId: satuan.id,
            qty_price: data.qty_price,
            convert_item: data.convert_item
        }

        const newSatuanItem = await this.repo.create(dataSender, tx);
        this.logger.info(`new item satuan with itemid: ${newSatuanItem.itemId} and satuanId: ${newSatuanItem.satuanId} was created successfully`,{context: this.ctx});
        return this.toItemSatuanResponse(newSatuanItem);
    }

    async updateItemSatuan(
        id: number,
        data: ItemSatuanRequest
    ): Promise<ItemSatuanResponse> {
        this.logger.info(`starting update item satuan with id: ${id}`,{context: this.ctx});
        const currentData = await this.itemSatuanMustExists(id);
        const item = await this.itemService.itemMustExists(data.itemId);
        const satuan = await this.satuanService.satuanMustExist(data.satuanId);
        
        data.itemId = item.id;
        data.satuanId = satuan.id;

        const updatedItemSatuan = await this.repo.update(currentData.id, data);

        this.logger.info(`item satuan with id: ${id} was updated successfully`, {context: this.ctx});
        return this.toItemSatuanResponse(updatedItemSatuan);
    }

    async removeIteSatuan(
        id: number
    ): Promise<ItemSatuanResponse> {
        this.logger.info(`starting remove data item satuan with id: ${id}`, {context: this.ctx});
        const currentData = await this.itemSatuanMustExists(id);

        const deletedItemSatuan = await this.repo.remove(currentData.id);
        this.logger.info(`item satuan with id: ${id} was removed successfully`, {context: this.ctx});
        return this.toItemSatuanResponse(deletedItemSatuan);
    }

    async findByItem(
        itemId: number
    ): Promise<ItemSatuanResponse[]> {
        this.logger.debug(`Searching item with item id: ${itemId}`,{context: this.ctx});
        const item = await this.itemService.itemMustExists(itemId);
        const listData = await this.repo.findByItem(item.id);

        return listData.map((item) => this.toItemSatuanResponse(item));
    }

    async findByItemAndSatuan(
        itemId: number,
        satuanId: number
    ): Promise<ItemSatuanResponse | null> {
        this.logger.debug(`Searching item satuan with item id: ${itemId} and satuanId: ${satuanId}`,{context: this.ctx});
        const data = await this.repo.findByItemAndSatuan(itemId, satuanId);
        if(!data){
            return null
        }
        
        return this.toItemSatuanResponse(data);
    }
}