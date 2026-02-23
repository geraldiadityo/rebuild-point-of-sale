import { Body, Controller, DefaultValuePipe, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Put, Query, UsePipes, ValidationPipe } from "@nestjs/common";
import { ItemService } from "./item.service";
import { ItemRequestDTO, ItemResponse, ItemResponseWithStok, ItemUpdateDefaultIndex, UpdateAvgCost } from "./dto/item.model";
import { ApiResponse } from "src/utils/web.model";
import { QueryOptionDTO } from "./dto/query-option.dto";

@Controller('/api/master/barang/item')
export class ItemController {
    constructor(
        private service: ItemService
    ) {}

    @Post('/create-item')
    @HttpCode(201)
    async create(
        @Body() request: ItemRequestDTO
    ): Promise<ApiResponse<ItemResponse>>{
        const result = await this.service.createItem(request);

        return {
            data: result,
            message: `item with name ${result.nama_item} was created successfully`
        }
    }

    @Post('/generate-barcode')
    @HttpCode(200)
    async generateBarcode(): Promise<ApiResponse<string>>{
        const result = this.service.generateInternalEan13();

        return {
            data: result,
            message: 'Barcode generate success!'
        }
    }

    @Put('/update-item/:id')
    @HttpCode(200)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() request: ItemRequestDTO
    ): Promise<ApiResponse<ItemResponse>> {
        const result = await this.service.updateItem(id, request);

        return {
            data: result,
            message: 'data item was updated successfully'
        }
    }

    @Patch('/set-manual-modal/:id')
    @HttpCode(200)
    async updateAvg(
        @Param('id', ParseIntPipe) id: number,
        @Body() request: UpdateAvgCost
    ): Promise<ApiResponse<ItemResponse>> {
        const result = await this.service.updateAvg(id, request);

        return {
            data: result,
            message: 'Success update modal'
        }
    }

    @Delete('/delete-item/:id')
    @HttpCode(200)
    async remove(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<boolean>>{
        const result = await this.service.removeItem(id);

        return {
            data: true,
            message: `item with name ${result.nama_item} was deleted successfully`,
        }
    }

    @Get('/view')
    @HttpCode(200)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async getAll(
        @Query() queryOptions: QueryOptionDTO
    ): Promise<ApiResponse<ItemResponseWithStok[]>>{
        const { data, meta } = await this.service.getAll(queryOptions);

        return {
            data: data,
            totalItem: meta.totalItem,
            totalPage: meta.totalPage,
            currentPage: meta.currentPage,
            message: 'success'
        }
    }

    @Get('/view/:id')
    @HttpCode(200)
    async findById(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<ItemResponseWithStok>> {
        const result = await this.service.itemMustExists(id);

        return {
            data: result,
            message: 'found it'
        }
    }

    @Get('/get-by-barcode/:barcode')
    @HttpCode(200)
    async getByBarode(
        @Param('barcode') barcode: string
    ): Promise<ApiResponse<ItemResponseWithStok>>{
        const result = await this.service.findByBarcode(barcode);

        return {
            data: result,
            message: 'Found it'
        }
    }

    @Patch('/update-default-index/:id')
    @HttpCode(200)
    async updateDefaultIndex(
        @Param('id', ParseIntPipe) id: number,
        @Body() request: ItemUpdateDefaultIndex
    ): Promise<ApiResponse<ItemResponse>> {
        const result = await this.service.updateDefaultIndex(id, request);

        return {
            data: result,
            message: 'success updated'
        }
    }
}