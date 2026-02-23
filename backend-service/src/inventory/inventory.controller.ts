import { Body, Controller, DefaultValuePipe, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Query, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { ApiResponse } from "src/utils/web.model";
import { InventoryDTO, InventoryPenyesuaianDTO, InventoryQueryOptionsDTO, InventoryResponse } from "./dto/inventory.model";
import { Roles } from "src/common/role.decorator";
import { InvntoryTransactionType } from "@prisma/client";

@Controller('/api/inventory')
export class InventoryController {
    constructor(
        private service: InventoryService
    ) {}

    @Post('/create-stok/:itemId')
    @HttpCode(200)
    async createStok(
        @Param('itemId', ParseIntPipe) itemId: number,
        @Body() request: InventoryPenyesuaianDTO
    ): Promise<ApiResponse<InventoryResponse>> {
        const dataSender: InventoryDTO = {
            itemId: itemId,
            stok: request.stok,
            tanggal_terima: new Date(),
            expired_date: request.expired_date ? new Date(request.expired_date) : undefined,
            transaction_type: InvntoryTransactionType.PENYESUAIAN_STOK
        };

        const result = await this.service.createInventory(dataSender);

        return {
            data: result,
            message: `Success create new inventory`
        }
    }
    
    @Get('/view')
    @HttpCode(200)
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async getAll(
        @Query() queryOption: InventoryQueryOptionsDTO
    ): Promise<ApiResponse<InventoryResponse[]>>{
        const { data, meta } = await this.service.getAll(queryOption);

        return {
            data: data,
            message: 'success',
            totalItem: meta.totalItem,
            totalPage: meta.totalPage,
            currentPage: meta.currentPage
        }
    }

    @Delete('/delete-inventory/:id')
    @HttpCode(200)
    @Roles('superadmin', 'admin', 'admin gudang')
    async remove(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<boolean>>{
        const result = await this.service.removeInventory(id);

        return {
            data: true,
            message: 'data inventory was delete successfully'
        }
    }
}