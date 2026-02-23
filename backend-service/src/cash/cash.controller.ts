import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, ParseIntPipe, Patch, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { CashService } from "./cash.service";
import { CashCreateDTO, CashEditDTO, CashMutationCreateDTO, CashMutationDTO, CashMutationQueryOptionDTO, CashMutationResponse, CashResponse } from "./cash.model";
import { ApiResponse } from "src/utils/web.model";
import { Roles } from "src/common/role.decorator";
import { RolesGuard } from "src/common/role.guard";
import { Auth } from "src/common/auth.decorator";
import { PayloadDecoded } from "src/auth/dto/auth.model";

@Controller('/api/cash')
export class CashController {
    constructor(
        private readonly service: CashService
    ) {}

    @Post('/create-cash')
    @HttpCode(201)
    async create(
        @Body() request: CashCreateDTO
    ): Promise<ApiResponse<CashResponse>> {
        const result = await this.service.create(request);

        return {
            data: result,
            message: `create cash with name: ${result.cash_name} was successfully`
        }
    }

    @Put('/update-cash/:id')
    @HttpCode(200)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() request: CashCreateDTO
    ): Promise<ApiResponse<CashResponse>> {
        const result = await this.service.update(id, request);
        
        return {
            data: result,
            message: `updated cash with id: ${id} was successfully`
        }
    }

    @Patch('/tarik-setor/:type/:id')
    @HttpCode(200)
    async tarikSetor(
        @Param('id', ParseIntPipe) id: number,
        @Param('type') type: string,
        @Body() request: CashEditDTO,
        @Auth() pengguna: PayloadDecoded,
    ): Promise<ApiResponse<CashResponse>> {
        let result: CashResponse
        const currentCash = await this.service.cashMustExist(id);
        if(type === 'tarik'){
            result = await this.service.decreaseCash(id, request.values);
        } else if (type === 'setor'){
            result = await this.service.increaseCash(id, request.values);
        } else {
            throw new HttpException('Param not accepted', HttpStatus.BAD_REQUEST);
        }
        
        const cashMutation: CashMutationDTO = {
            cashId: id,
            saldo_awal: currentCash.values,
            type: type,
            value: request.values,
            saldo_akhir: result.values,
            keterangan: request.keterangan,
            penggunaId: pengguna.sub,
            shift: request.shift,
        };

        await this.service.createMutationCash(cashMutation);

        return {
            data: result,
            message: 'success'
        }
    }

    @Get('/cash-mutation/:cashId')
    @HttpCode(200)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @Roles('superadmin', 'admin', 'kasir')
    @UseGuards(RolesGuard)
    async getMutation(
        @Param('cashId', ParseIntPipe) cashId: number,
        @Query() queryOption: CashMutationQueryOptionDTO
    ): Promise<ApiResponse<CashMutationResponse[]>>{
        const { data, meta } = await this.service.getCashMutation(cashId, queryOption);

        return {
            data: data,
            message: 'success',
            totalItem: meta.totalItem,
            totalPage: meta.totalPage,
            currentPage: meta.currentPage
        }
    }

    @Get('/view')
    @HttpCode(200)
    async getAll(): Promise<ApiResponse<CashResponse[]>> {
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
    ): Promise<ApiResponse<CashResponse>> {
        const result = await this.service.cashMustExist(id);

        return {
            data: result,
            message: 'success'
        }
    }

    @Delete('/delete-cash/:id')
    @HttpCode(200)
    async removeCash(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<boolean>> {
        const result = await this.service.removeCash(id);

        return {
            data: true,
            message: `cash with name: ${result.cash_name} was deleted successfully`
        }
    }
}