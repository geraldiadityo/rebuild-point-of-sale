import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from "@nestjs/common";
import { AttributeService } from "./attribute.service";
import { AttributeCreateDto, AttributeResponse } from "./attribute.model";
import { ApiResponse } from "src/utils/web.model";

@Controller('/api/attribute')
export class AttributeController {
    constructor(
        private readonly service: AttributeService
    ) {}

    @Post()
    @HttpCode(201)
    async create(
        @Body() request: AttributeCreateDto
    ): Promise<ApiResponse<AttributeResponse>> {
        const resut = await this.service.updateAttribute(request);

        return {
            data: resut,
            message: `attribute with key: ${request.key} was successfully created`
        }
    }

    @Delete('/:key')
    @HttpCode(200)
    async remove(
        @Param('key') key: string
    ): Promise<ApiResponse<boolean>>{
        const result = await this.service.removeAttribute(key);

        return {
            data: true,
            message: `attribute with key: ${key} was successfully removed`
        }
    }

    @Get()
    @HttpCode(200)
    async getAll(): Promise<ApiResponse<AttributeResponse[]>>{
        const result = await this.service.getAll();

        return {
            data: result,
            message: 'success'
        }
    }

    @Get('/:key')
    @HttpCode(200)
    async getKey(
        @Param('key') key: string
    ): Promise<ApiResponse<AttributeResponse>>{
        const result = await this.service.keyMustExists(key);

        return {
            data: result,
            message: 'success'
        }
    }
}