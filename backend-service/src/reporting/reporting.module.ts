import { Module } from "@nestjs/common";
import { PembelianModule } from "src/pembelian/pembelian.module";
import { ReportingService } from "./reporting.service";
import { ReportingController } from "./reporting.controller";
import { PenjualanModule } from "src/penjualan/penjualan.module";
import { CashModule } from "src/cash/cash.module";

@Module({
    imports: [
        PembelianModule,
        PenjualanModule,
        CashModule,
    ],
    providers: [
        ReportingService
    ],
    controllers: [
        ReportingController
    ]
})
export class ReportingModule {}