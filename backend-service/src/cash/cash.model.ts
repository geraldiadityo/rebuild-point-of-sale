import { Type } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { PenggunaResponse } from "src/master/pengguna/dto/pengguna.model";

export class CashResponse {
    id: number;
    cash_name: string;
    values: number;
}

export class CashCreateDTO {
    cash_name: string;
    values: number;
}

export class CashEditDTO {
    keterangan: string;
    values: number;
    shift: string;
}

export enum CashMutationOrderByField {
    TANGGAL = 'tanggal',
    VALUE = 'value',
}

export class CashMutationQueryOptionDTO {
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
    @IsEnum(CashMutationOrderByField, { message: 'not include accepted order' })
    orderByField: CashMutationOrderByField = CashMutationOrderByField.TANGGAL;

    @IsOptional()
    @Type(() => Number)
    @IsIn([1, -1])
    orderByDirection?: 1 | -1 = -1;
}

export class CashMutationResponse {
    id: number;
    cash: CashResponse;
    type: string;
    saldo_awal: number | null;
    keterangan: string;
    value: number;
    saldo_akhir: number | null;
    tanggal: Date;
    pengguna: PenggunaResponse | null;
    shift: string | null;
}

export class CashMutationCreateDTO {
    cashId: number;
    type: string;
    keterangan: string;
    value: number;
    penggunaId: number;
    shift: string;
}

export class CashMutationDTO extends CashMutationCreateDTO {
    saldo_awal: number;
    saldo_akhir: number;
}