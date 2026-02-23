import { ItemResponse } from "../../item/dto/item.model";
import { SatuanResponse } from "../../satuan/dto/satuan.model";

export class ItemSatuanRequestDTO {
    satuanId: number;
    convert_item: number;
    qty_price: number;
}

export class ItemSatuanRequest {
    itemId: number;
    satuanId: number;
    convert_item: number;
    qty_price: number;
}

export class ItemSatuanResponse {
    id: number;
    item: ItemResponse | null;
    satuan: SatuanResponse | null;
    convert_item: number;
    qty_price: number;
}
