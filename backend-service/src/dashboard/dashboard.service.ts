import { Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { CashService } from "src/cash/cash.service";
import { PembelianService } from "src/pembelian/pembelian.service";
import { PenjualanService } from "src/penjualan/penjualan.service";
import { Logger } from "winston";
import { DashboardResponse } from "./dashboard.model";
import { RallPembelianQuery, RallPenjualanQuery } from "src/reporting/dto/reporting.model";

@Injectable()
export class DashboardService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly penjualanService: PenjualanService,
        private readonly cashService: CashService
    ) {}

    async getDataDashboard(): Promise<DashboardResponse> {
        const today = new Date();
        const startDateToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
        const endDateToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // Ingat: Januari = 0, Februari = 1, dst.

        // 1. Start Date: Tanggal 1 bulan ini, jam 00:00:00
        const startDateMonth = new Date(year, month, 1, 0, 0, 0);

        // 2. End Date: Tanggal 0 bulan berikutnya (trik untuk dapat tanggal terakhir bulan ini), jam 23:59:59
        // new Date(year, month + 1, 0) akan memberikan hari terakhir dari bulan 'month'
        const endDateMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

        const queryPenjualanHari: RallPenjualanQuery = {
            startDate: startDateToday.toISOString(),
            endDate: endDateToday.toISOString()
        };

        const totalPenjualanHari = await this.penjualanService.getTotalPenjualanByDate(startDateToday, endDateToday)

        const penjualanBulanQuery: RallPenjualanQuery = {
            startDate: startDateMonth.toISOString(),
            endDate: endDateMonth.toISOString(),
        }
        
        const dataPenjualanBulan = await this.penjualanService.getAllPenjualanForReporting(penjualanBulanQuery);
        const dataCash = await this.cashService.getAll();
        
        return {
            data_penjualan_hari: totalPenjualanHari,
            data_penjualan_bulan: dataPenjualanBulan,
            data_cash: dataCash
        }
    }
}