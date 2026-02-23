import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { DiscountService } from "./discount.service";
import { ChangeStatusRequest, DiscountQueryOptionDTO, DiscountRequestCreateDTO, DiscountResponse } from "./dto/discount.model";
import { ApiResponse } from "src/utils/web.model";
import { Roles } from "src/common/role.decorator";
import { RolesGuard } from "src/common/role.guard";

@Controller('/api/discount')
export class DiscountController {
    constructor(
        private readonly service: DiscountService
    ) {}

    @Post('/create-discount')
    @HttpCode(201)
    @Roles('superadmin', 'admin')
    @UseGuards(RolesGuard)
    async create(
        @Body() request: DiscountRequestCreateDTO
    ): Promise<ApiResponse<DiscountResponse>> {
        const result = await this.service.createDiscount(request);

        return {
            data: result,
            message: `discount with name ${result.nama} was created successfully`
        }
    }

    @Put('/update-discount/:id')
    @HttpCode(200)
    @Roles('superdmin', 'admin')
    @UseGuards(RolesGuard)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() request: DiscountRequestCreateDTO
    ): Promise<ApiResponse<DiscountResponse>> {
        const result = await this.service.updateDiscount(id, request);

        return {
            data: result,
            message: `data discount with id: ${id} was successfully updated`
        }
    }

    @Patch(`/change-status/:id`)
    @HttpCode(200)
    @Roles('superadmin', 'admin')
    @UseGuards(RolesGuard)
    async changeStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() request: ChangeStatusRequest
    ): Promise<ApiResponse<DiscountResponse>> {
        const result = await this.service.changeStatus(id, request);

        return {
            data: result,
            message: `Success change status discount with id: ${id}`
        }
    }

    @Delete('/remove-discount/:id')
    @HttpCode(200)
    @Roles('superadmin', 'admin')
    async remove(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<boolean>> {
        const result = await this.service.removeDiscount(id);

        return {
            data: true,
            message: `data discount with name: ${result.nama} was removed successfully`
        }
    }
    
    @Get('/view')
    @HttpCode(200)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async getAll(
        @Query() queryOption: DiscountQueryOptionDTO
    ): Promise<ApiResponse<DiscountResponse[]>> {
        const { data, meta } = await this.service.getAll(queryOption);

        return {
            data: data,
            message: 'success',
            totalItem: meta.totalItem,
            totalPage: meta.totalPage,
            currentPage: meta.currentPage
        }
    }

    @Get('/get-cuppon/:nama')
    @HttpCode(200)
    async getCuppon(
        @Param('nama') nama: string
    ): Promise<ApiResponse<DiscountResponse>> {
        const result = await this.service.getDiscByName(nama);

        return {
            data: result,
            message: 'success'
        }
    }
}