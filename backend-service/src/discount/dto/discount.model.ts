import { Type } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export enum DiscountOrderByField {
    OCCURS_UNTIL = 'occours_until',
    NAMA = 'nama',
    ID = 'id'
}

export class DiscountQueryOptionDTO {
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
    @IsEnum(DiscountOrderByField, { message: 'not accept order by field' })
    orderByField: DiscountOrderByField = DiscountOrderByField.ID;

    @IsOptional()
    @Type(() => Number)
    @IsIn([1, -1])
    orderByDirection?: 1 | -1 = 1;
    
}

export class DiscountResponse {
    id: number;
    nama: string;
    price: number;
    occurs_until: Date;
    status: boolean;
}

export class DiscountRequestCreateDTO {
    nama: string;
    price: number;
    occurs_until: string;
}

export class DiscountCreateDTO {
    nama: string;
    price: number;
    occurs_until: Date;
}

export class ChangeStatusRequest {
    status: string;
}