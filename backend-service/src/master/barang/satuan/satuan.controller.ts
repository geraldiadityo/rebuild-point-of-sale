import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { SatuanService } from "./satuan.service";
import { SatuanCreateDTO, SatuanResponse } from "./dto/satuan.model";
import { ApiResponse } from "src/utils/web.model";

@Controller('/api/master/barang/satuan')
export class SatuanController {
    constructor(
        private service: SatuanService
    ) {}

    @Post('/create-satuan')
    @HttpCode(201)
    async create(
        @Body() request: SatuanCreateDTO
    ): Promise<ApiResponse<SatuanResponse>> {
        const result = await this.service.createSatuan(request);

        return {
            data: result,
            message: 'Satuan was created successfully'
        }
    }
    
    @Put('/update-satuan/:id')
    @HttpCode(200)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() request: SatuanCreateDTO
    ): Promise<ApiResponse<SatuanResponse>>{
        const result = await this.service.updateSatuan(id, request);
        
        return {
            data: result,
            message: `satuan with id ${id} was updated successfully`
        }
    }

    @Delete('/delete-satuan/:id')
    @HttpCode(200)
    async remove(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<boolean>>{
        const result = await this.service.removeSatuan(id);

        return {
            data: true,
            message: `Satuan with name: ${result.nama} was deleted successfully`
        }
    }

    @Get('/view')
    @HttpCode(200)
    async getAll(): Promise<ApiResponse<SatuanResponse[]>> {
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
    ): Promise<ApiResponse<SatuanResponse>>{
        const result = await this.service.satuanMustExist(id)

        return {
            data: result,
            message: 'found it'
        }
    }
}