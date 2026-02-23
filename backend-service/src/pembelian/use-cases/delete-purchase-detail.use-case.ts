import { Injectable } from "@nestjs/common";
import { PembelianRepository } from "../pembelian.repository";
import { InventoryService } from "src/inventory/inventory.service";
import { ItemService } from "src/master/barang/item/item.service";
import { TransaksiDetailRequestUpdateDTO } from "../dto/pembelian.model";
import { Prisma } from "@prisma/client";

@Injectable()
export class DeletePurchaseDetailsUseCase {
    constructor(
        private readonly repo: PembelianRepository,
        private readonly inventoryService: InventoryService,
        private readonly itemService: ItemService
    ) {}

    async execute(
        detailsToDelete: TransaksiDetailRequestUpdateDTO[],
        tx: Prisma.TransactionClient
    ): Promise<void>{
        for (const item of detailsToDelete){
            const barang = await this.itemService.findByBarcode(item.barcode);
            if(!barang) continue;

            const deletedDetail = await this.repo.deleteDetail(item.id, tx);
            if(!deletedDetail) continue;

            const inventory = await this.inventoryService.getByItemAndTanggal(
                barang.id,
                deletedDetail.tanggal,
                tx
            );

            if(inventory){
                await this.inventoryService.removeInventory(inventory.id, tx);
            }
        }
    }
}