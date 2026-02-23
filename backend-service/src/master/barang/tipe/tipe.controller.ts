import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { TipeService } from "./tipe.service";
import { TipeCreateDTO, TipeResponse } from "./dto/tipe.model";
import { ApiResponse } from "src/utils/web.model";

@Controller('/api/master/barang/tipe')
export class TipeController {
    constructor(
        private service: TipeService
    ) {}

    @Post('/create-tipe')
    @HttpCode(201)
    async create(
        @Body() request: TipeCreateDTO
    ): Promise<ApiResponse<TipeResponse>>{
        const result = await this.service.createTipe(request);

        return {
            data: result,
            message: `tipe with name ${result.nama} was created successfully`
        }
    }

    @Put('/update-tipe/:id')
    @HttpCode(200)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() request: TipeCreateDTO
    ): Promise<ApiResponse<TipeResponse>> {
        const result = await this.service.updateTipe(id, request);

        return {
            data: result,
            message: `tipe was updated successfully`
        }
    }

    @Delete('/delete-tipe/:id')
    @HttpCode(200)
    async remove(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<boolean>>{
        const result = await this.service.removeTipe(id);

        return {
            data: true,
            message:`tipe with name: ${result.nama} was deleted successfully`
        }
    }

    @Get('/view')
    @HttpCode(200)
    async getAll(): Promise<ApiResponse<TipeResponse[]>> {
        const result = await this.service.getAll();

        return {
            data: result,
            message: 'success'
        }
    }

    @Get('/view/:id')
    @HttpCode(200)
    async getById(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<TipeResponse>>{
        const result = await this.service.tipeMustExist(id);

        return {
            data: result,
            message: 'found it'
        }
    }
}