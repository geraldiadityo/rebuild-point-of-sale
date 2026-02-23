import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { PembelianService } from "./pembelian.service";
import { DetailResponseDTO, PembelianQueryOptionsDTO, PembelianResponse, RequestDeleteTransaksi, RequestTransaksi, RequestUpdateTransaksi, UpdateBillingDTO } from "./dto/pembelian.model";
import { ApiResponse } from "src/utils/web.model";
import { Throttle } from "@nestjs/throttler";
import { Roles } from "src/common/role.decorator";
import { RolesGuard } from "src/common/role.guard";
import { Auth } from "src/common/auth.decorator";
import { PayloadDecoded } from "src/auth/dto/auth.model";

@Controller('/api/transaksi/pembelian')
export class PembelianController {
    constructor(
        private service: PembelianService
    ) {}

    @Throttle({ default: { limit: 5, ttl: 10000 } })
    @Post('/create-pembelian')
    @Roles('superadmin','admin', 'admin gudang')
    @HttpCode(201)
    async create(
        @Body() request: RequestTransaksi,
        @Auth() pengguna: PayloadDecoded,
    ): Promise<ApiResponse<PembelianResponse>> {
        const result = await this.service.createPembelian(request, pengguna.sub);

        return {
            data: result,
            message: `pembelian barang with no faktur: ${result.no_faktur} was successfully`
        }
    }

    @Get('/view')
    @HttpCode(200)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @Roles('superadmin','admin', 'admin gudang')
    @UseGuards(RolesGuard)
    async getAll(
        @Query() queryOption: PembelianQueryOptionsDTO
    ): Promise<ApiResponse<PembelianResponse[]>>{
        const { data, meta } = await this.service.getAll(queryOption);

        return {
            data: data,
            message: 'success',
            totalItem: meta.totalItem,
            totalPage: meta.totalPage,
            currentPage: meta.currentPage
        }
    }

    @Get('/view-detail/:pembelianId')
    @HttpCode(200)
    async getDetailByPembelianId(
        @Param('pembelianId', ParseIntPipe) pembelianId: number
    ): Promise<ApiResponse<DetailResponseDTO>>{
        const transaksi = await this.service.pembelianMustExists(pembelianId);
        const detail = await this.service.getDetailByIdPembelian(transaksi.id);
        const result: DetailResponseDTO = {
            transaksi: transaksi,
            detail: detail
        };

        return {
            data: result,
            message: 'success'
        }
    }

    @Throttle({ default: { limit: 5, ttl: 10000 } })
    @Post('/update-billing/:id')
    @HttpCode(200)
    @Roles('superadmin' ,'admin', 'admin gudang')
    @UseGuards(RolesGuard)
    async updateBilling(
        @Param('id', ParseIntPipe) id: number,
        @Body() request: UpdateBillingDTO,
        @Auth() pengguna: PayloadDecoded,
    ): Promise<ApiResponse<PembelianResponse>>{
        const result = await this.service.updateBilling(id, request.bayar, request.cashId, pengguna.sub, request.shift);
        
        return {
            data: result,
            message: 'Billing update success'
        }
    }

    @Throttle({ default: { limit: 5, ttl: 10000 } })
    @Put('/update-pembelian/:id')
    @HttpCode(200)
    @Roles('superadmin','admin', 'admin gudang')
    @UseGuards(RolesGuard)
    async updatePembelian(
        @Param('id', ParseIntPipe) id: number,
        @Body() request: RequestUpdateTransaksi
    ): Promise<ApiResponse<PembelianResponse>> {
        const result = await this.service.updatePembelian(id, request);

        return {
            data: result,
            message: `success update data pembelian with no faktur: ${result.no_faktur}`
        }
    }

    @Delete('/remove-pembelian/:id')
    @HttpCode(200)
    @Roles('superadmin', 'admin', 'admin gudang')
    async removePembelian(
        @Param('id', ParseIntPipe) id: number,
        @Body() request: RequestDeleteTransaksi
    ): Promise<ApiResponse<boolean>>{
        const result = await this.service.removePembelianWithArray(request.pembelianId);

        return {
            data: true,
            message: 'Success remove data pembelian'
        }
    }
}