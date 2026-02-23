import { Type } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export enum SupplierOrderField {
    NAMA_SUPPLIER = 'nama_supplier',
    ALAMAT = 'alamat'
}

export class SupplierQueryOptionDTO {
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
    @IsEnum(SupplierOrderField, { message: `orderByField must be one of the following values: ${Object.values(SupplierOrderField).join(', ')}`})
    orderByField: SupplierOrderField = SupplierOrderField.NAMA_SUPPLIER;
    
    @IsOptional()
    @Type(() => Number)
    @IsIn([1, -1])
    orderByDirection?: 1 | -1 = 1;
}

export class SupplierDTO {
    nama_supplier: string;
    alamat: string;
    no_telp: string;
    deskripsi?: string;
}

export class SupplierResponse {
    id: number;
    nama_supplier: string;
    alamat: string;
    no_telp: string;
    deskripsi: string | null
}