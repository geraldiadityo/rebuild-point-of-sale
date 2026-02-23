import { Injectable } from "@nestjs/common";
import { InventoryService } from "src/inventory/inventory.service";
import { ItemSatuanService } from "src/master/barang/item_satuan/item_satuan.service";
import { PenjualanDetailCreate, PenjualanDetailRequest } from "../dto/penjualan.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class ProcessSaleDetailsUseCase {
    constructor(
        private readonly itemSatuanServie: ItemSatuanService,
        private readonly inventoryService: InventoryService
    ) {}

    async execute(
        details: PenjualanDetailRequest[],
        penjualanId: number,
        tanggal: Date,
        tx: Prisma.TransactionClient
    ): Promise<{
        detailToCreate: PenjualanDetailCreate[];
        total: number,
    }> {
        const detailToCreate: PenjualanDetailCreate[] = [];
        let total: number = 0;

        for (const item of details){
            const itemSatuan = await this.itemSatuanServie.itemSatuanMustExists(item.itemSatuanId);
            const qtyReal: number = itemSatuan.convert_item * item.qty;
            
            await this.inventoryService.reducingStok(item.itemId, qtyReal, tx);

            detailToCreate.push({
                penjualanId: penjualanId,
                itemSatuanId: itemSatuan.id,
                harga: item.harga,
                qty: item.qty,
                tanggal: tanggal
            });

            total += (item.qty * item.harga)
        }

        return { detailToCreate, total }
    }
}