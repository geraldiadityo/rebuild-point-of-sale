import { Module } from "@nestjs/common";
import { InventoryModule } from "src/inventory/inventory.module";
import { ItemSatuanModule } from "src/master/barang/item_satuan/item_satuan.module";
import { PenjualanRepository } from "./penjualan.repository";
import { PenjualanService } from "./penjualan.service";
import { PenjualanController } from "./penjualan.controller";
import { ProcessSaleDetailsUseCase } from "./use-cases/process-sale-details.use-case";
import { CalculateFinalSaleUseCase } from "./use-cases/calculate-final-sale.use-case";
import { AccumulateSaleUseCase } from "./use-cases/acumulate-sale.use-case";
import { PembelianModule } from "src/pembelian/pembelian.module";
import { CashModule } from "src/cash/cash.module";
import { ItemModule } from "src/master/barang/item/item.module";

@Module({
    imports: [
        ItemSatuanModule,
        InventoryModule,
        PembelianModule,
        CashModule,
        ItemModule,
    ],
    providers: [
        PenjualanRepository,
        PenjualanService,
        
        // use-case
        ProcessSaleDetailsUseCase,
        CalculateFinalSaleUseCase,
        AccumulateSaleUseCase,
    ],
    controllers: [
        PenjualanController
    ],
    exports: [
        PenjualanService,
    ]
})
export class PenjualanModule {}