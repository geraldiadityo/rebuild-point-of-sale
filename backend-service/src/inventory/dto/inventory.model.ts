import { InvntoryTransactionType, Prisma } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { ItemResponse } from "src/master/barang/item/dto/item.model";

export enum InventoryOrderByField {
    ITEM = 'item',
    TANGGAL_TERIMA = 'tanggal_terima',
    STOK = 'stok'
}

export class InventoryQueryOptionsDTO {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    pageSize: number = 10;

    @IsOptional()
    @IsString()
    keyword?: string;

    @IsOptional()
    @IsEnum(InventoryOrderByField, { message: `orderByField must be one of the following values: ${Object.values(InventoryOrderByField).join(', ')}`})
    orderByField: InventoryOrderByField = InventoryOrderByField.TANGGAL_TERIMA;

    @IsOptional()
    @Type(() => Number)
    @IsIn([1, -1],{ message: 'orderByDirection must be either 1 (ASC) or -1 (DESC)'  })
    orderByDirection?: 1 | -1 = -1;
}
export class InventoryDTO {
    itemId: number;
    stok: number;
    tanggal_terima: Date;
    expired_date?: Date;
    transaction_type: InvntoryTransactionType;
}

export class InventoryPenyesuaianDTO {
    stok: number;
    expired_date?: string;
}

export class InventoryResponse {
    id: number;
    item: ItemResponse | null;
    stok: number;
    tanggal_terima: Date;
    expired_date: Date | null;
    status: boolean;
    transaction_type: string;
}

export type StokSumRawRes = {
    itemId: number,
    total_stok: bigint;
}

export class InventoryManyPayload {
    count: number;
}