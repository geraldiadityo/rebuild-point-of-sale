import { Controller, Get, HttpCode, Param, ParseIntPipe, Query, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ReportingService } from "./reporting.service";
import { RallPembelianQuery, RallPenjualanQuery, RCashMutationQuery, RlabaKotor, RShift, RShiftCashMutationQuery } from "./dto/reporting.model";
import { ApiResponse } from "src/utils/web.model";
import { PembelianResponse } from "src/pembelian/dto/pembelian.model";
import { PenjualanResponse } from "src/penjualan/dto/penjualan.dto";
import { Roles } from "src/common/role.decorator";
import { RolesGuard } from "src/common/role.guard";
import { CashMutationResponse } from "src/cash/cash.model";

@Controller('/api/reporting')
export class ReportingController {
    constructor(
        private service: ReportingService
    ) {}

    @Get('/transaksi/pembelian')
    @HttpCode(200)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @Roles('superadmin', 'admin')
    @UseGuards(RolesGuard)
    async pembelianReporting(
        @Query() queryOptions: RallPembelianQuery
    ): Promise<ApiResponse<PembelianResponse[]>> {
        const result = await this.service.laporanPembelian(queryOptions);

        return {
            data: result,
            message: `success get data`
        }
    }

    @Get('/transaksi/penjualan')
    @HttpCode(200)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @Roles('superadmin', 'admin')
    @UseGuards(RolesGuard)
    async penjualanReporting(
        @Query() queryOptions: RallPenjualanQuery
    ): Promise<ApiResponse<PenjualanResponse[]>> {
        const result = await this.service.laporanPenjualan(queryOptions);

        return {
            data: result,
            message: 'success'
        }
    }

    @Get('/transaksi/laba-kotor')
    @HttpCode(200)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @Roles('superadmin', 'admin')
    @UseGuards(RolesGuard)
    async labaKotor(
        @Query() queryOptions: RallPenjualanQuery
    ): Promise<ApiResponse<RlabaKotor[]>> {
        const result = await this.service.laporanLabaKotor(queryOptions);

        return {
            data: result,
            message: 'success',
        }
    }

    @Get('/cash-mutation/:cashId')
    @HttpCode(200)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @Roles('superadmin', 'admin')
    @UseGuards(RolesGuard)
    async cashMutation(
        @Param('cashId', ParseIntPipe) cashId: number,
        @Query() queryOptions: RCashMutationQuery
    ): Promise<ApiResponse<CashMutationResponse[]>> {
        const result = await this.service.reportingCashMutation(cashId, queryOptions);

        return {
            data: result,
            message: 'success'
        }
    }
    
    @Get('/cash-shift/:cashId')
    @HttpCode(200)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @Roles('superadmin', 'admin')
    @UseGuards(RolesGuard)
    async cashShift(
        @Param('cashId', ParseIntPipe) cashId: number,
        @Query() queryOptions: RShiftCashMutationQuery,
    ): Promise<ApiResponse<RShift>> {
        const result = await this.service.reportingShift(cashId, queryOptions);
        // console.log(result)

        return {
            data: result,
            message: 'success'
        }
    }
}