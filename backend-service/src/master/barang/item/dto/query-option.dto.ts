import { Type } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export enum ItemOrderByField {
    NAMA_ITEM = 'nama_item',
    SKU = 'sku',
    BARCODE = 'barcode'
}

export class QueryOptionDTO {
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
    @IsEnum(ItemOrderByField, { message: `orderByField must be one of the following values: ${Object.values(ItemOrderByField).join(', ')}`})
    orderByField: ItemOrderByField = ItemOrderByField.NAMA_ITEM;

    @IsOptional()
    @Type(() => Number)
    @IsIn([1, -1], { message: 'orderByDirection must be either 1 (ASC) or -1 (DESC)'  })
    orderByDirection?: 1 | -1 = 1;
}