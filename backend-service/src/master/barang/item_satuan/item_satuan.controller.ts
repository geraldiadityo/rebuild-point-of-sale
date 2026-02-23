import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { ItemSatuanService } from "./item_satuan.service";
import { ItemSatuanRequest, ItemSatuanRequestDTO, ItemSatuanResponse } from "./dto/item_satuan.model";
import { ApiResponse } from "src/utils/web.model";

@Controller('/api/master/barang/item-satuan')
export class ItemSatuanController {
    constructor(
        private service: ItemSatuanService
    ) {}

    @Post('/create-satuan-item/:itemId')
    @HttpCode(201)
    async create(
        @Param('itemId', ParseIntPipe) itemId: number,
        @Body() request: ItemSatuanRequestDTO
    ): Promise<ApiResponse<ItemSatuanResponse>> {
        const dataSender: ItemSatuanRequest = {
            itemId: itemId,
            satuanId: request.satuanId,
            convert_item: request.convert_item,
            qty_price: request.qty_price
        }

        const result = await this.service.createItemSatuan(dataSender);
        return {
            data: result,
            message: `item satuan was created successfully`
        }
    }

    @Put('/update-satuan-item/:id/:itemId')
    @HttpCode(200)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Param('itemId', ParseIntPipe) itemId: number,
        @Body() request: ItemSatuanRequestDTO
    ): Promise<ApiResponse<ItemSatuanResponse>> {
        const dataSender: ItemSatuanRequest = {
            itemId: itemId,
            satuanId: request.satuanId,
            convert_item: request.convert_item,
            qty_price: request.qty_price
        };

        const result = await this.service.updateItemSatuan(id, dataSender);

        return {
            data: result,
            message: `item satuan with id: ${id} was updated successfully`
        }
    }

    @Delete('/delete-satuan-item/:id')
    @HttpCode(200)
    async remove(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<boolean>>{
        const result = await this.service.removeIteSatuan(id);

        return {
            data: true,
            message: `item satuan was deleted successfully`
        }
    }

    @Get('/view-by-item/:itemId')
    @HttpCode(200)
    async getByItem(
        @Param('itemId', ParseIntPipe) itemId: number
    ): Promise<ApiResponse<ItemSatuanResponse[]>> {
        const result = await this.service.findByItem(itemId);

        return {
            data: result,
            message: 'success'
        }
    }
    
    @Get('/get-item-satuan/:itemId/:satuanId')
    @HttpCode(200)
    async getByItemAndSatuan(
        @Param('itemId', ParseIntPipe) itemId: number,
        @Param('satuanId', ParseIntPipe) satuanId: number
    ): Promise<ApiResponse<ItemSatuanResponse | null>> {
        const result = await this.service.findByItemAndSatuan(itemId, satuanId);

        return {
            data: result,
            message: 'success'
        }
    }

    @Get('/view/:id')
    @HttpCode(200)
    async getById(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<ItemSatuanResponse>> {
        const result = await this.service.itemSatuanMustExists(id);

        return {
            data: result,
            message: 'found it'
        }
    }
}