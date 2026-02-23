import { Module } from "@nestjs/common";
import { CashModule } from "src/cash/cash.module";
import { PenjualanModule } from "src/penjualan/penjualan.module";
import { DashboardService } from "./dashboard.service";
import { DashboardController } from "./dashboard.controller";

@Module({
    imports: [
        PenjualanModule,
        CashModule
    ],
    providers: [
        DashboardService,
    ],
    controllers: [
        DashboardController
    ]
})
export class DashboardModule {}