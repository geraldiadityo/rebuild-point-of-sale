import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString } from "class-validator";
import { StatusOrder } from "src/pembelian/dto/pembelian.model";

export class RallPembelianQuery {
    @IsOptional()
    @IsString()
    startDate?: string;

    @IsOptional()
    @IsString()
    endDate?: string;

    @IsOptional()
    @IsEnum(StatusOrder, { message: 'not include accept status' })
    status?: StatusOrder;

    @IsOptional()
    @IsString()
    supplier?: string;
}


export class RallPenjualanQuery {
    @IsOptional()
    @IsString()
    startDate?: string;

    @IsOptional()
    @IsString()
    endDate?: string;

    @IsOptional()
    @IsString()
    pengguna?: string;
}

export class RCashMutationQuery {
    @IsOptional()
    @IsString()
    startDate?: string;
    
    @IsOptional()
    @IsString()
    endDate?: string;
}

export class RShiftCashMutationQuery {
    @IsOptional()
    @IsString()
    startDate?: string;

    @IsOptional()
    @IsString()
    endDate?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    penggunaId?: number;

    @IsOptional()
    @IsString()
    shift?: string
}

export class RlabaKotor {
    tanggal: Date;
    sub_total: number;
    total_pokok: number;
    laba_kotor: number;
}

export class RShift {
    tanggal: Date;
    shift: string;
    cash_name: string;
    nama_pengguna: string;
    saldo_awal: number;
    pemasukan: number;
    pengeluaran: number;
    saldo_akhir: number;
}