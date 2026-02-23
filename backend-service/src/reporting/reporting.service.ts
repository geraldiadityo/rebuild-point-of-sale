import { HttpException, HttpStatus, Inject } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { PembelianResponse } from "src/pembelian/dto/pembelian.model";
import { Logger } from "winston";
import { RallPembelianQuery, RallPenjualanQuery, RCashMutationQuery, RlabaKotor, RShift, RShiftCashMutationQuery } from "./dto/reporting.model";
import { PembelianService } from "src/pembelian/pembelian.service";
import { PenjualanService } from "src/penjualan/penjualan.service";
import { PenjualanResponse } from "src/penjualan/dto/penjualan.dto";
import { PrismaService } from "src/common/prisma.service";
import { CashService } from "src/cash/cash.service";
import { CashMutationResponse } from "src/cash/cash.model";

export class ReportingService {
    private readonly ctx = 'ReportingService';
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private pembelianService: PembelianService,
        private penjualanService: PenjualanService,
        private cashService: CashService,
        private readonly prisma: PrismaService
    ) {}

    // pembelian reporting
    async laporanPembelian(
        query: RallPembelianQuery
    ): Promise<PembelianResponse[]>{
        this.logger.debug(`get data pembelian for reporting with dynamic query`,{context: this.ctx});
        const result = await this.pembelianService.getAllForReporting(query);
        
        return result;
    }

    async laporanPenjualan(
        query: RallPenjualanQuery
    ): Promise<PenjualanResponse[]> {
        const result = await this.penjualanService.getAllPenjualanForReporting(query);

        return result
    }

    async reportingCashMutation(
        cashId: number,
        query: RCashMutationQuery
    ): Promise<CashMutationResponse[]> {
        const result = await this.cashService.getCashMutationForReporting(cashId, query);

        return result;

    }

    async reportingShift(
        cashId: number,
        query: RShiftCashMutationQuery
    ): Promise<RShift> {
        const listData = await this.cashService.getCashMutationForShiftReporting(query, cashId);
        if (listData.length === 0) {
            return {
                tanggal: new Date(query.startDate || new Date()),
                shift: query.shift || '',
                nama_pengguna: 'Kosong',
                saldo_awal: 0,
                saldo_akhir: 0,
                pemasukan: 0,
                pengeluaran: 0,
                cash_name: 'current cash'
                
            }
        }
        let totalMasuk: number = 0;
        let totalKeluar: number = 0;
        let totalKembalian: number = 0;
        let saldo_awal: number = listData[0].saldo_awal || 0;
        let tanggal: Date = listData[0].tanggal;
        let cash_name: string = listData[0].cash.cash_name || '';
        let pengguna: string = listData[0].pengguna?.nama || '';
        let shift: string = listData[0].shift ?? '';
        
        listData.map((item) => {
            if(item.type === 'setor'){
                totalMasuk += item.value;
            } else if (item.type === 'tarik'){
                if(item.keterangan === 'Kembalian'){
                    totalKembalian += item.value;
                } else {
                    totalKeluar += item.value;
                }
            }
        });

        const total_masuk: number = totalMasuk - totalKembalian;
        const total_keluar: number = totalKeluar;
        const saldo_akhir: number = (saldo_awal + total_masuk) - total_keluar;
        
        return {
            tanggal: tanggal,
            shift: shift,
            nama_pengguna: pengguna,
            saldo_awal: saldo_awal ? saldo_awal : 0,
            pemasukan: total_masuk,
            pengeluaran: total_keluar,
            saldo_akhir: saldo_akhir,
            cash_name: cash_name,
        }
    }

    async laporanLabaKotor(
        query: RallPenjualanQuery
    ): Promise<RlabaKotor[]> {
        try {
            const startDate = query.startDate ? new Date(query.startDate) : new Date();
            const endDate = query.endDate ? new Date(query.endDate) : new Date();

            startDate.setHours(0,0,0,0);
            endDate.setHours(23, 59, 59, 999);

            const result = await this.penjualanService.getLabaKotorReport(startDate, endDate);

            return result;
        } catch (err){
            this.logger.error(`something error with this service ${err.message}`,{context: this.ctx});
            throw new HttpException('something error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}