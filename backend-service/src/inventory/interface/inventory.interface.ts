import { Inventory, Prisma } from "@prisma/client";
import { InventoryDTO, InventoryManyPayload, StokSumRawRes } from "../dto/inventory.model";
import { FindAllIventoryArgs } from "../inventory.repository";

export interface IInvetoryRepository {
    create(data: InventoryDTO, tx?: Prisma.TransactionClient): Promise<Inventory>;
    createMany(data: InventoryDTO[], tx?: Prisma.TransactionClient): Promise<InventoryManyPayload>;
    remove(id: number): Promise<Inventory>;
    findAll(args: FindAllIventoryArgs): Promise<Inventory[]>;
    findBySku(sku: string): Promise<Inventory[]>;
    findById(id: number): Promise<Inventory | null>;
    sumStokBySkus(itemIds: number[]): Promise<StokSumRawRes[]>;
    countAll(where?: Prisma.InventoryWhereInput): Promise<number>;
    findAndLockOneByItemId(itemId: number, qty: number, tx?: Prisma.TransactionClient): Promise<Inventory | null>;
    updateStok(id: number, newStok: number, tx?: Prisma.TransactionClient): Promise<Inventory>;
    findByItemIdAndTanggal(itemId: number, tanggal: Date, tx?: Prisma.TransactionClient): Promise<Inventory | null>;
    changeStatusByExpired(): Promise<{count: number}>;
}