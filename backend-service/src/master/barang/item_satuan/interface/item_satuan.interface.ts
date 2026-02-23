import { Item_satuan, Prisma } from "@prisma/client";
import { ItemSatuanRequest } from "../dto/item_satuan.model";

export interface ISatuanItemRepository {
    create(data: ItemSatuanRequest, tx?: Prisma.TransactionClient): Promise<Item_satuan>;
    update(id: number, data: ItemSatuanRequest): Promise<Item_satuan>;
    remove(id: number): Promise<Item_satuan>;
    findByItem(itemId: number): Promise<Item_satuan[]>;
    findAll(take: number, skip: number): Promise<Item_satuan[]>;
    findById(id: number): Promise<Item_satuan | null>;
    findByItemAndSatuan(itemId: number, satuanId: number, tx?: Prisma.TransactionClient): Promise<Item_satuan | null>;
    countAll(): Promise<number>;
}