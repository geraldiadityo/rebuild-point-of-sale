import { Type } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { ItemResponse } from "src/master/barang/item/dto/item.model";
import { ItemSatuanResponse } from "src/master/barang/item_satuan/dto/item_satuan.model";
import { SatuanResponse } from "src/master/barang/satuan/dto/satuan.model";
import { SupplierResponse } from "src/supplier/dto/supplier.model";

export enum PembelianOrderByField {
    TANGGAL = 'tanggal',
    TANGGAL_TERIMA = 'tanggal_terima',
    TANGGAL_JATUH_TEMPO = 'tanggal_jatuh_tempo',
}

export enum StatusOrder {
    LUNAS = 'lunas',
    BELUM = 'belum'
}

export class PembelianQueryOptionsDTO {
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
    @IsEnum(PembelianOrderByField, { message: 'Not include accept order by' })
    orderByField: PembelianOrderByField = PembelianOrderByField.TANGGAL;

    @IsOptional()
    @Type(() => Number)
    @IsIn([1, -1])
    orderByDirection?: 1 | -1 = -1;

    @IsOptional()
    @IsEnum(StatusOrder, {message: 'not include accept status'})
    status?: StatusOrder;
}
export class PembelianResponse {
    id: number;
    tanggal: Date;
    tanggal_terima: Date;
    tanggal_jatuh_tempo: Date;
    no_faktur: string;
    supplier: SupplierResponse | null;
    total: number;
    sisa_pembayaran: number;
    status: boolean;
}

export class TransaksiRequestDTO {
    tanggal_terima: string;
    tanggal_jatuh_tempo: string;
    no_faktur: string;
    nama_supplier: string;
    alamat: string;
    no_telp: string;
    total: number;
    bayar: number;
    cashId: number;
}

export class TransaksiDetailRequestDTO {
    barcode: string;
    nama_item: string;
    kategoriId: number;
    tipeId: number;
    satuanId: number;
    expired_date?: string;
    convert_qty: number;
    price: number;
    qty: number;
    harga_beli: number;
}

export class TransaksiCreateDTO {
    tanggal: Date;
    tanggal_terima: Date;
    tanggal_jatuh_tempo: Date;
    no_faktur: string;
    supplierId: number;
    total: number;
    sisa_pembayaran: number;
}

export class TransaksiDetailCreateDTO {
    pembelianId: number;
    itemSatuanId: number;
    qty: number;
    harga_beli: number;
    tanggal: Date;
}

export class TransaksiDetailRequestUpdateDTO {
    id: number;
    barcode: string;
    nama_item: string;
    kategoriId: number;
    tipeId: number;
    satuanId: number;
    expired_date?: string;
    convert_qty: number;
    price: number;
    qty: number;
    harga_beli: number;
}

export class RequestTransaksi {
    transaksi: TransaksiRequestDTO;
    detail: TransaksiDetailRequestDTO[];
    shift: string;
}

export class RequestUpdateTransaksi {
    transaksi: TransaksiRequestDTO;
    detail: TransaksiDetailRequestUpdateDTO[];
}

export class RequestDeleteTransaksi {
    pembelianId: number[];
}

export class CreateTransaksiPembelian {
    transaksi: TransaksiCreateDTO;
    detail: TransaksiDetailCreateDTO[];
}

export class TransaksiDetailPayloadResponse {
    count: number;
}

export class DetailTransaksiResponse {
    id: number;
    tanggal: Date;
    item: ItemResponse;
    satuan: SatuanResponse;
    item_satuan: ItemSatuanResponse;
    harga_beli: number;
    qty: number;
    total_harga: number;
}

export class DetailResponseDTO {
    transaksi: PembelianResponse;
    detail: DetailTransaksiResponse[];
}

export class UpdateBillingDTO {
    bayar: number;
    cashId: number;
    shift: string;
}