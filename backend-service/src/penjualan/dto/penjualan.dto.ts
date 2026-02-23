import { Type } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";
import { ItemResponse } from "src/master/barang/item/dto/item.model";
import { ItemSatuanResponse } from "src/master/barang/item_satuan/dto/item_satuan.model";
import { SatuanResponse } from "src/master/barang/satuan/dto/satuan.model";
import { PenggunaResponse } from "src/master/pengguna/dto/pengguna.model";

export enum PenjualanOrderByField {
    TANGGAL = 'tanggal',
    DISCOUNT = 'discount',
    GRAND_TOTAL = 'grand_total',
}

export class PenjualanQueryOptionDTO {
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
    @IsEnum(PenjualanOrderByField, { message: 'not accepted order by' })
    orderByField: PenjualanOrderByField = PenjualanOrderByField.TANGGAL;

    @IsOptional()
    @Type(() => Number)
    @IsIn([1, -1])
    orderByDirection?: 1 | -1 = -1;
}

export class PenjualanResponse {
    id: number;
    tanggal: Date;
    invoice: string;
    total: number;
    discount: number;
    grand_total: number;
    bayar: number;
    tipe_pembayaran: string | null;
    kembalian: number;
    pengguna: PenggunaResponse | null;
}

export class PenjualanRequestCreate {
    total: number;
    discount: number;
    grand_total: number;
    bayar: number;
    tipe_pembayaran: string;
    kembalian: number;
    cashId: number;
    tanggal?: string;
    
    @IsOptional()
    @IsUUID('4')
    external_id?: string;
}

export class PenjualanDetailRequest {
    itemId: number;
    itemSatuanId: number;
    harga: number;
    qty: number;
}

export class PenjualanRequestDTO {
    transaksi: PenjualanRequestCreate;
    detail: PenjualanDetailRequest[];
    shift: string;
}

export class PenjualanCreate {
    tanggal: Date;
    invoice: string;
    total: number;
    external_id?: string;
    discount: number;
    grand_total: number;
    bayar: number;
    tipe_pembayaran: string;
    kembalian: number;
    penggunaId: number;
}

export class PenjualanDetailCreate {
    penjualanId: number;
    itemSatuanId: number;
    harga: number;
    qty: number;
    tanggal: Date;
}

export class PenjualanDetailResPayload {
    count: number
}

export class PenjualanDetailResponse {
    id: number;
    item_satuan: ItemSatuanResponse;
    item: ItemResponse;
    satuan: SatuanResponse | null;
    harga: number;
    qty: number;
}

export class TransaksiPenjualanResponse {
    transaksi: PenjualanResponse;
    detail: PenjualanDetailResponse[];
}

export class KeranjangCreateDTO {
    itemId: number;
    itemSatuanId: number;
    harga: number;
    qty: number;
}

export class KeranjangRequestDTO {
    data: KeranjangCreateDTO[]
}
export class KeranjangInsert {
    no_keranjang: string;
    itemId: number;
    itemSatuanId: number;
    harga: number;
    qty: number;
}

export class KeranjangResPayload {
    count: number
}

export class KeranjangResponse {
    id: number;
    no_keranjang: string;
    item: ItemResponse;
    satuan: SatuanResponse;
    itemSatuanId: number;
    harga: number;
    qty: number
}

export class NoKeranjangWithItemCount {
    no_keranjang: string;
    jumlah_item: number;
}