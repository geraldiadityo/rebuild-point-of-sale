import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, ParseIntPipe, Patch, Post, Put, UseGuards } from "@nestjs/common";
import { PenggunaService } from "./pengguna.service";
import { PenggunaCreateDTO, PenggunaRequestDTO, PenggunaResponse, PenggunaUpdateDTO, ResetPasswordDTO } from "./dto/pengguna.model";
import { ApiResponse } from "src/utils/web.model";
import { Roles } from "src/common/role.decorator";
import { RolesGuard } from "src/common/role.guard";

@Controller('/api/master/pengguna')
export class PenggunaController {
    constructor(
        private service: PenggunaService
    ) {}

    @Post('/create-pengguna')
    @HttpCode(201)
    @Roles('superadmin')
    @UseGuards(RolesGuard)
    async create(
        @Body() request: PenggunaRequestDTO
    ): Promise<ApiResponse<PenggunaResponse>> {
        if(request.password !== request.confirm_password){
            throw new HttpException('password and confirm password is not matched', HttpStatus.BAD_REQUEST);
        }

        const dataSend: PenggunaCreateDTO = {
            username: request.username,
            password: request.password,
            nama: request.nama,
            roleId: request.roleId
        }
        
        const result = await this.service.createPengguna(dataSend);
        return {
            data: result,
            message: `Pengguna with username ${result.username} was created successfully`
        }
    }

    @Put('/update-pengguna/:id')
    @HttpCode(200)
    @Roles('superadmin')
    @UseGuards(RolesGuard)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() request: PenggunaUpdateDTO
    ): Promise<ApiResponse<PenggunaResponse>> {
        const result = await this.service.updatePengguna(id, request);

        return {
            data: result,
            message: 'Success updated data pengguna'
        }
    }

    @Patch('/reset-password/:id')
    @HttpCode(200)
    @Roles('superadmin')
    @UseGuards(RolesGuard)
    async resetPassword(
        @Param('id', ParseIntPipe) id: number,
        @Body() request: ResetPasswordDTO
    ): Promise<ApiResponse<boolean>> {
        if (request.new_password !== request.confirm_password){
            throw new HttpException('new password and confirm password is not matched', HttpStatus.BAD_REQUEST)
        }

        const result = await this.service.resetPassword(id, request);
        
        return {
            data: true,
            message: `Success reset password pengguna ${result.nama}`
        }
    }

    @Patch('/change-status/:id')
    @HttpCode(200)
    @Roles('superadmin')
    @UseGuards(RolesGuard)
    async changeStatus(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<ApiResponse<PenggunaResponse>> {
        const result = await this.service.changeStatus(id);

        return {
            data: result,
            message: 'success change status pengguna'
        }
    }

    @Delete('/remove-pengguna/:id')
    @HttpCode(200)
    @Roles('superadmin')
    @UseGuards(RolesGuard)
    async remove(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<boolean>> {
        const result = await this.service.removePengguna(id);

        return {
            data: true,
            message: `Pengguna with username ${result.username} was deleted successfully`
        }
    }

    @Get('/view')
    @HttpCode(200)
    @Roles('superadmin')
    @UseGuards(RolesGuard)
    async getAll(): Promise<ApiResponse<PenggunaResponse[]>> {
        const result = await this.service.getAllPengguna();
        
        return {
            data: result,
            message: 'success'
        }
    }

    @Get('/view/:id')
    @HttpCode(200)
    @Roles('superadmin')
    @UseGuards(RolesGuard)
    async getById(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<PenggunaResponse>> {
        const result = await this.service.penggunaMustExists(id);

        return {
            data: result,
            message: 'found it'
        }
    }
}