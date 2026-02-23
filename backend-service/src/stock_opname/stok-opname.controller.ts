import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post, Query, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { StokOpnameService } from "./stock-opname.service";
import { Auth } from "src/common/auth.decorator";
import { PayloadDecoded } from "src/auth/dto/auth.model";
import { FullStokOpnameResponse, StartStokOpnameDTO, StokOpnameDetailResponse, StokOpnameQueryOption, StokOpnameResponse, SubmitCountsDTO } from "./dto/stock-opname.model";
import { ApiResponse } from "src/utils/web.model";
import { Roles } from "src/common/role.decorator";
import { RolesGuard } from "src/common/role.guard";

@Controller('/api/stok-opname')
export class StokOpnameController {
    constructor(
        private readonly service: StokOpnameService
    ) {}

    @Post('/start')
    @HttpCode(201)
    @Roles('superadmin', 'admin', 'admin gudang')
    @UseGuards(RolesGuard)
    async start(
        @Auth() pengguna: PayloadDecoded,
        @Body() request: StartStokOpnameDTO
    ): Promise<ApiResponse<StokOpnameResponse>> {
        const result = await this.service.startOpname(pengguna.sub, request.catatan);

        return {
            data: result,
            message: `Session stok opname #${result.id} was successfully started`
        }
    }

    @Post('/submit-count/:id')
    @HttpCode(200)
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    @Roles('superadmin', 'admin' ,'admin gudang')
    @UseGuards(RolesGuard)
    async submitCount(
        @Param('id', ParseIntPipe) id: number,
        @Body() request: SubmitCountsDTO
    ): Promise<ApiResponse<boolean>>{
        await this.service.submitCounts(id, request.counts);

        return {
            data: true,
            message: 'data hitungan berhasil di simpan'
        }
    }

    @Post('/finish/:id')
    @HttpCode(200)
    @Roles('superadmin', 'admin', 'admin gudang')
    @UseGuards(RolesGuard)
    async finish(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<StokOpnameResponse>> {
        const result = await this.service.finishOpname(id);

        return {
            data: result,
            message: `Stok opname with id: ${result.id} was finished`
        }
    }

    @Get('/view')
    @HttpCode(200)
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async getAll(
        @Query() query: StokOpnameQueryOption
    ): Promise<ApiResponse<StokOpnameResponse[]>> {
        const {data, meta} = await this.service.getAll(query);

        return {
            data: data,
            message: 'success',
            totalItem: meta.totalItem,
            totalPage: meta.totalPage,
            currentPage: meta.currentPage
        }
    }

    @Get('/view/:id')
    @HttpCode(200)
    async getById(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<FullStokOpnameResponse>> {
        const result = await this.service.getFullDetailById(id);

        return {
            data: result,
            message: 'success'
        }
    }
}