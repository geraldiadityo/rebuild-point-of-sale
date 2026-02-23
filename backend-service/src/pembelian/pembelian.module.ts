import { Module } from "@nestjs/common";
import { InventoryModule } from "src/inventory/inventory.module";
import { ItemModule } from "src/master/barang/item/item.module";
import { ItemSatuanModule } from "src/master/barang/item_satuan/item_satuan.module";
import { PembelianRepository } from "./pembelian.repository";
import { PembelianService } from "./pembelian.service";
import { PembelianController } from "./pembelian.controller";
import { SupplierModule } from "src/supplier/supplier.module";
import { CalculateFinalTransactionsStateUseCase } from "./use-cases/calculate-final-transaction-state.use-case";
import { ProcessPurchaseDetailsUseCase } from "./use-cases/process-purchase-detail.use-case";
import { FindOrCreateSupplierUseCase } from "./use-cases/find-or-create-supplier.use-case";
import { DeletePurchaseDetailsUseCase } from "./use-cases/delete-purchase-detail.use-case";
import { ValidateFakturOnUpdateUseCase } from "./use-cases/validate-faktur-on-update.use-case";
import { AveragePriceItemUseCase } from "./use-cases/average-price-item.use-case";
import { CashModule } from "src/cash/cash.module";

@Module({
    imports: [
        ItemModule,
        ItemSatuanModule,
        InventoryModule,
        SupplierModule,
        CashModule,
    ],
    providers: [
        PembelianRepository,
        PembelianService,

        // use-case
        CalculateFinalTransactionsStateUseCase,
        ProcessPurchaseDetailsUseCase,
        FindOrCreateSupplierUseCase,
        DeletePurchaseDetailsUseCase,
        ValidateFakturOnUpdateUseCase,
        AveragePriceItemUseCase
    ],
    controllers: [
        PembelianController
    ],
    exports: [
        PembelianService,
    ]
})
export class PembelianModule {}