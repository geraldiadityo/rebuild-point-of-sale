import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post, Query, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { PenjualanService } from "./penjualan.service";
import { KeranjangCreateDTO, KeranjangRequestDTO, KeranjangResponse, NoKeranjangWithItemCount, PenjualanQueryOptionDTO, PenjualanRequestDTO, PenjualanResponse, TransaksiPenjualanResponse } from "./dto/penjualan.dto";
import { ApiResponse } from "src/utils/web.model";
import { Auth } from "src/common/auth.decorator";
import { PayloadDecoded } from "src/auth/dto/auth.model";
import { Throttle } from "@nestjs/throttler";
import { Roles } from "src/common/role.decorator";
import { RolesGuard } from "src/common/role.guard";

@Controller('/api/transaksi/penjualan')
export class PenjualanController {
    constructor(
        private service: PenjualanService
    ) {}

    @Get('/view')
    @HttpCode(200)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async getAll(
        @Query() queryOption: PenjualanQueryOptionDTO
    ): Promise<ApiResponse<PenjualanResponse[]>>{
        const { data, meta } = await this.service.getAll(queryOption);

        return {
            data: data,
            message: 'succeess',
            totalItem: meta.totalItem,
            totalPage: meta.totalPage,
            currentPage: meta.currentPage
        }
    }

    @Throttle({ default: { limit: 6, ttl: 10000 } })
    @Post('/create-penjualan')
    @HttpCode(200)
    @Roles('superadmin', 'admin', 'kasir')
    @UsePipes(new ValidationPipe({transform :true, whitelist: true}))
    @UseGuards(RolesGuard)
    async create(
        @Auth() pengguna: PayloadDecoded,
        @Body() request: PenjualanRequestDTO
    ): Promise<ApiResponse<TransaksiPenjualanResponse>>{
        const transaksi = await this.service.createPenjualan(request, pengguna.sub);
        
        const res = await this.service.getTransaksiAndDetail(transaksi.id);

        return {
            data: res,
            message: `Penjualan with no invoice: ${transaksi.invoice} was successfully created`
        }
    }

    @Get('/view-detail/:penjualanId')
    @HttpCode(200)
    async getDetail(
        @Param('penjualanId', ParseIntPipe) penjualanId: number
    ): Promise<ApiResponse<TransaksiPenjualanResponse>>{
        const result = await this.service.getTransaksiAndDetail(penjualanId);
        
        return {
            data: result,
            message: 'success'
        }
    }

    // keranjang
    @Post('/insert-to-keranjang')
    @HttpCode(200)
    @Roles('superadmin','admin', 'kasir')
    @UseGuards(RolesGuard)
    async insertKeranjang(
        @Body() request: KeranjangRequestDTO
    ): Promise<ApiResponse<boolean>>{
        await this.service.insertIntoKeranjang(request);

        return {
            data: true,
            message: `success insert to keranjang`
        }
    }

    @Get('/get-detail-keranjang/:no_keranjang')
    @HttpCode(200)
    async getDetailKeranjang(
        @Param('no_keranjang') no_keranjang: string
    ): Promise<ApiResponse<KeranjangResponse[]>>{
        const result = await this.service.getAndDeleteKeranjang(no_keranjang);

        return {
            data: result,
            message: 'success'
        }
    }

    @Get('/list-keranjang')
    @HttpCode(200)
    async getListKeranjang(): Promise<ApiResponse<NoKeranjangWithItemCount[]>>{
        const result = await this.service.listKeranjangWithCountItem();

        return {
            data: result,
            message: 'success'
        }
    }
}