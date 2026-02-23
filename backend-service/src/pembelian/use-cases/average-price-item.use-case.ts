import { Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { DetailTransaksiResponse } from "../dto/pembelian.model";
import { ItemService } from "src/master/barang/item/item.service";
import { ItemResponseWithStok } from "src/master/barang/item/dto/item.model";
import { ItemSatuanResponse } from "src/master/barang/item_satuan/dto/item_satuan.model";

@Injectable()
export class AveragePriceItemUseCase {
    private readonly ctx = 'AveragePriceItemUseCase';
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly itemService: ItemService
    ) {}

    async execute(
        itemData: ItemResponseWithStok,
        itemSatuan: ItemSatuanResponse,
        total_harga: number,
        qty: number,
    ): Promise<number> {
        this.logger.debug(`starting set average price`,{context: this.ctx});
        let totalQtyComs: number;
        totalQtyComs = qty * itemSatuan.convert_item;
        if (itemData.avg_cost === 0 || itemData.avg_cost === null){
            return Math.ceil(total_harga/totalQtyComs);
        }

        const safeCurrentStock = itemData.total_stok ? itemData.total_stok < 0 ? 0 : itemData.total_stok : 0
        const totalOldValue = safeCurrentStock * itemData.avg_cost;
        const finalTotalValue = totalOldValue + total_harga;
        const finalQty = safeCurrentStock + totalQtyComs;
        this.logger.debug('get average price done',{context: this.ctx});
        
        if(finalQty <= 0){
            return itemData.avg_cost;
        }

        const newAvgHPP = finalTotalValue / finalQty;
        const finalHPP = Math.ceil(newAvgHPP);

        return finalHPP;
    }
}