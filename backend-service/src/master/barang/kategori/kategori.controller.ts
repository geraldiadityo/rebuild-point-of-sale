import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { KategoriService } from "./kategori.service";
import { KategoriCreateDTO, KategoriResponse } from "./dto/kategori.model";
import { ApiResponse } from "src/utils/web.model";

@Controller('/api/master/barang/kategori')
export class KategoriController {
    constructor(
        private service: KategoriService
    ){}

    @Post('/create-kategori')
    @HttpCode(201)
    async create(
        @Body() request: KategoriCreateDTO
    ): Promise<ApiResponse<KategoriResponse>>{
        const result = await this.service.createKategori(request);

        return {
            data: result,
            message: `New Kategori was created successfully`
        }
    }

    @Put('/update-kategori/:id')
    @HttpCode(200)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() request: KategoriCreateDTO
    ): Promise<ApiResponse<KategoriResponse>>{
        const result = await this.service.updateKategori(id, request);
        
        return {
            data: result,
            message: `kategori was updated successfully`
        }
    }

    @Delete('/delete-kategori/:id')
    @HttpCode(200)
    async remove(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<boolean>>{
        const result = await this.service.removeKategori(id);

        return {
            data: true,
            message: `Kategori was deleted successfully`
        }
    }

    @Get('/view')
    @HttpCode(200)
    async getAll(): Promise<ApiResponse<KategoriResponse[]>>{
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
    ): Promise<ApiResponse<KategoriResponse>>{
        const result = await this.service.kategoriMustExists(id);

        return {
            data: result,
            message: 'Found it'
        }
    }
}