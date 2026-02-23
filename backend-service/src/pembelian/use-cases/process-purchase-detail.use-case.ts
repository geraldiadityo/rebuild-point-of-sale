import { Injectable } from "@nestjs/common";
import { ItemService } from "src/master/barang/item/item.service";
import { ItemSatuanService } from "src/master/barang/item_satuan/item_satuan.service";
import { TransaksiDetailCreateDTO, TransaksiDetailRequestDTO } from "../dto/pembelian.model";
import { InventoryDTO } from "src/inventory/dto/inventory.model";
import { ItemCreateDTO, ItemRequestDTO, ItemRequestWithAvg } from "src/master/barang/item/dto/item.model";
import { InvntoryTransactionType, Prisma } from "@prisma/client";
import { ItemSatuanRequest } from "src/master/barang/item_satuan/dto/item_satuan.model";
import { AveragePriceItemUseCase } from "./average-price-item.use-case";

@Injectable()
export class ProcessPurchaseDetailsUseCase {
    constructor(
        private readonly itemService: ItemService,
        private readonly satuanItemService: ItemSatuanService,
        private avgService: AveragePriceItemUseCase,
    ) {}

    async execute(
        details: TransaksiDetailRequestDTO[],
        tanggalTerima: Date,
        pembelianId: number,
        tx: Prisma.TransactionClient
    ): Promise<{
        detailsToCreate: TransaksiDetailCreateDTO[],
        inventoryToCreate: InventoryDTO[],
        total: number
    }>{
        const detailsToCreate: TransaksiDetailCreateDTO[] = [];
        const inventoryToCreate: InventoryDTO[] = [];
        let total: number = 0;
        
        for (const item of details){
            const dataBarang: ItemRequestDTO = {
                barcode: item.barcode,
                nama_item: item.nama_item,
                kategoriId: item.kategoriId,
                tipeId: item.tipeId,
            };

            const barang = await this.itemService.findOrCreate(dataBarang, tx);
            
            const dataItemSatuan: ItemSatuanRequest = {
                itemId: barang.id,
                satuanId: item.satuanId,
                convert_item: item.convert_qty,
                qty_price: item.price,
            }

            const satuanItem = await this.satuanItemService.findOrCreate(dataItemSatuan, tx);
            const avgCost = await this.avgService.execute(barang, satuanItem, item.qty * item.harga_beli, item.qty);
            await this.itemService.updateAvg(barang.id, {avg_cost: avgCost}, tx);
            detailsToCreate.push({
                pembelianId: pembelianId,
                itemSatuanId: satuanItem.id,
                qty: item.qty,
                harga_beli: item.harga_beli,
                tanggal: tanggalTerima
            });

            inventoryToCreate.push({
                itemId: barang.id,
                stok: item.qty * item.convert_qty,
                tanggal_terima: tanggalTerima,
                expired_date: item.expired_date ? new Date(item.expired_date) : undefined,
                transaction_type: InvntoryTransactionType.PEMBELIAN
            });

            total += item.qty * item.harga_beli
        }

        return { detailsToCreate, inventoryToCreate, total }
    }
}