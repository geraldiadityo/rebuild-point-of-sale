import { StokOpnameStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";
import { ItemResponse } from "src/master/barang/item/dto/item.model";
import { PenggunaResponse } from "src/master/pengguna/dto/pengguna.model";

export enum StokOpnameOrderByField {
    TANGGAL_MULAI = 'tanggal_mulai',
    ID = 'id'
}

export class StokOpnameQueryOption {
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
    @IsEnum(StokOpnameOrderByField, { message: 'not accepted order by' })
    orderByField: StokOpnameOrderByField = StokOpnameOrderByField.TANGGAL_MULAI;

    @IsOptional()
    @Type(() => Number)
    @IsIn([1, -1])
    orderByDirection?: 1 | -1 = -1;
}

export class StartStokOpnameDTO {
    @IsOptional()
    @IsString()
    catatan?: string;
}

class CountItemDTO {
    @IsInt()
    @IsNotEmpty()
    itemId: number;

    @IsInt()
    @Min(0)
    @IsNotEmpty()
    stock_real: number;
}

export class SubmitCountsDTO {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CountItemDTO)
    counts: CountItemDTO[];
}

export type CreateSesiOpnameData = {
    penggunaId: number;
    catatan?: string;
    tanggal_mulai: Date;
    status: StokOpnameStatus;
}

export type CreateDetailData = {
    opnameId: number;
    itemId: number;
    stock_system: number;
}

export class StokOpnameResponse {
    id: number;
    tanggal_mulai: Date;
    tanggal_selesai: Date | null;
    status: string;
    catatan: string | null;
    pengguna: PenggunaResponse | null;
}

export class StokOpnameDetailResponse {
    id: number;
    opnameId: number;
    item: ItemResponse;
    stock_system: number;
    stock_real: number | null;
    selisih: number | null;
}

export class FullStokOpnameResponse extends StokOpnameResponse {
    Stok_opname_detail: StokOpnameDetailResponse[];
}