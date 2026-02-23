import { KategoriResponse } from "../../kategori/dto/kategori.model";
import { TipeResponse } from "../../tipe/dto/tipe.model";

export class ItemRequestDTO {
    barcode: string;
    nama_item: string;
    kategoriId: number;
    tipeId: number;
    deskripsi?: string;
}

export class ItemRequestWithAvg extends ItemRequestDTO {
    avg_cost: number;
}

export class ItemCreateDTO {
    sku: string;
    barcode: string;
    nama_item: string;
    kategoriId: number;
    tipeId: number;
    deskripsi?: string;
}

export class UpdateAvgCost {
    avg_cost: number
}

export class ItemUpdateDTO {
    nama_item: string;
    kategoriId: number;
    tipeId: number;
}

export class SkuDTO {
    kodeKategori: string;
    kodeTipe: string;
    nama_item: string;
}

export class ItemResponse {
    id: number;
    sku: string;
    barcode: string;
    nama_item: string;
    kategori: KategoriResponse | null;
    tipe: TipeResponse | null;
    deskripsi?: string;
    default_index: number | null;
    avg_cost: number | null;
}

export class ItemResponseWithStok extends ItemResponse {
    total_stok?: number;
}

export class ItemUpdateDefaultIndex {
    default_index: number;
}