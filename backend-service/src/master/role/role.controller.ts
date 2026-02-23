import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, UseGuards } from "@nestjs/common";
import { RoleService } from "./role.service";
import { RoleCreateDTO, RoleResponse } from "./dto/role.model";
import { ApiResponse } from "src/utils/web.model";
import { Roles } from "src/common/role.decorator";
import { RolesGuard } from "src/common/role.guard";

@Controller('/api/master/role')
export class RoleController {
    constructor(
        private service: RoleService
    ) {}

    @Post('/create-role')
    @HttpCode(201)
    @Roles('superadmin')
    @UseGuards(RolesGuard)
    async create(
        @Body() request: RoleCreateDTO
    ): Promise<ApiResponse<RoleResponse>> {
        const result = await this.service.createRole(request);

        return {
            data: result,
            message: 'New role was created successfully'
        }
    }

    @Put('/update-role/:id')
    @HttpCode(200)
    @Roles('superadmin')
    @UseGuards(RolesGuard)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() request: RoleCreateDTO
    ): Promise<ApiResponse<RoleResponse>> {
        const result = await this.service.updateRole(id, request);

        return {
            data: result,
            message: `Role with id: ${id} was updated successfully`
        }
    }

    @Delete('/delete-role/:id')
    @HttpCode(200)
    @Roles('superadmin')
    @UseGuards(RolesGuard)
    async remove(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<boolean>>{
        const result = await this.service.removeRole(id);

        return {
            data: true,
            message: `Role with name ${result.nama} was deleted successfully`
        }
    }

    @Get('/view')
    @HttpCode(200)
    async getAll(): Promise<ApiResponse<RoleResponse[]>> {
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
    ): Promise<ApiResponse<RoleResponse>>{
        const result = await this.service.roleMustExists(id)

        return {
            data: result,
            message: 'Found it'
        }
    }
}