import { Injectable } from "@nestjs/common";
import { PembelianService } from "src/pembelian/pembelian.service";
import { PenjualanDetailResponse } from "../dto/penjualan.dto";
import { Prisma } from "@prisma/client";
import { ItemService } from "src/master/barang/item/item.service";

@Injectable()
export class AccumulateSaleUseCase {
    constructor(
        private readonly pembelianService: PembelianService,
        private readonly itemService: ItemService,
    ) {}

    async execute(
        data: PenjualanDetailResponse[],
        endDate: Date,
        tx?: Prisma.TransactionClient
    ): Promise<{
        sub_total: number,
        total_pokok: number
    }> {
        let total_pokok: number = 0;
        let sub_total: number = 0;
        const groupByItemId = data.reduce((acc, currentItem) => {
            const itemId = currentItem.item.id;
            
            const qty = currentItem.qty * (currentItem.item_satuan?.convert_item || 0);
            const totalPendapatan = currentItem.qty * currentItem.harga;
            if(!acc[itemId]){
                acc[itemId] = {
                    totalQty: 0,
                    totalPendapatan: 0
                }
            }

            acc[itemId].totalQty += qty
            acc[itemId].totalPendapatan += totalPendapatan;
            return acc;
        }, {});

        const resultArrayGroupItem = Object.keys(groupByItemId).map(itemId => ({
            itemId: parseInt(itemId),
            totalQty: groupByItemId[itemId].totalQty,
            totalPendapatan: groupByItemId[itemId].totalPendapatan
        }));

        for(const dataItem of resultArrayGroupItem){
            const item = await this.itemService.itemMustExists(dataItem.itemId, tx);
            const totalHpp = item.avg_cost || 0;
            const resultHpp = totalHpp * dataItem.totalQty;
            
            total_pokok += resultHpp;
            sub_total += dataItem.totalPendapatan;
        }

        return { sub_total, total_pokok }
    }
}