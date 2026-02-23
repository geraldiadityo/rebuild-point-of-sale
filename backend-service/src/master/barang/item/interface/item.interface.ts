import { Item, Prisma, PrismaClient } from "@prisma/client";
import { ItemCreateDTO, SkuDTO } from "../dto/item.model";
import { FindAllItemArgs } from "../item.repository";


export interface IItemRepository {
    create(data: ItemCreateDTO): Promise<Item>;
    update(id: number, data: Partial<Item>, tx?: Prisma.TransactionClient): Promise<Item>;
    delete(id: number): Promise<Item>;
    upsert(data: ItemCreateDTO, tx?: Prisma.TransactionClient): Promise<Item>;
    findByLastSkuPrefix(prefix: string, tx: Prisma.TransactionClient): Promise<Item | null>;
    findById(id: number, tx?: Prisma.TransactionClient): Promise<Item | null>;
    findByName(nama_item: string, tx?: Prisma.TransactionClient): Promise<Item | null>;
    findAll(args: FindAllItemArgs): Promise<Item[]>;
    // search(take: number, skip: number, keyword: string): Promise<Item[]>;
    findByBarcode(barcode: string): Promise<Item | null>;
    findBySku(sku: string): Promise<Item | null>;
    countAll(where?: Prisma.ItemWhereInput): Promise<number>;
}