import { Body, Controller, DefaultValuePipe, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Query, UsePipes, ValidationPipe } from "@nestjs/common";
import { SupplierService } from "./supplier.service";
import { SupplierDTO, SupplierQueryOptionDTO, SupplierResponse } from "./dto/supplier.model";
import { ApiResponse } from "src/utils/web.model";

@Controller('/api/supplier')
export class SupplierController {
    constructor(
        private service: SupplierService
    ) {}

    @Post('/create-supplier')
    @HttpCode(201)
    async create(
        @Body() request: SupplierDTO
    ): Promise<ApiResponse<SupplierResponse>>{
        const result = await this.service.createSupplier(request);

        return {
            data: result,
            message: `Supplier with name ${result.nama_supplier} was created successfully`,
        }
    }

    @Put('/update-supplier/:id')
    @HttpCode(200)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() request: SupplierDTO
    ): Promise<ApiResponse<SupplierResponse>>{
        const result = await this.service.updateSupplier(id, request);

        return {
            data: result,
            message: `Supplier was updated successfully`
        }
    }

    @Delete('/delete-supplier/:id')
    @HttpCode(200)
    async remove(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<boolean>>{
        const result = await this.service.removeSupplier(id);

        return {
            data: true,
            message: `Supplier with name: ${result.nama_supplier} was removed successfully`
        }
    }

    @Get('/view')
    @HttpCode(200)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async view(
        @Query() queryOption: SupplierQueryOptionDTO
    ): Promise<ApiResponse<SupplierResponse[]>>{
        const { data, meta } = await this.service.getAll(queryOption);

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
    ): Promise<ApiResponse<SupplierResponse>>{
        const result = await this.service.supplierMustExists(id);

        return {
            data: result,
            message: 'Found it'
        }
    }
}