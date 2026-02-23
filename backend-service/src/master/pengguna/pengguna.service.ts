import { HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { PenggunaRepository } from "./pengguna.repository";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { RoleService } from "../role/role.service";
import { PenggunaCreateDTO, PenggunaResponse, PenggunaUpdateDTO, ResetPasswordDTO } from "./dto/pengguna.model";
import * as bcryptjs from 'bcryptjs';
import { Pengguna, Prisma } from "@prisma/client";
import { PrismaService } from "src/common/prisma.service";

@Injectable()
export class PenggunaService {
    private readonly ctx = 'PenggunaService';
    constructor(
        private readonly repo: PenggunaRepository,
        private roleService: RoleService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private prisma: PrismaService,
    ) {}

    private toPenggunaResponse(pengguna: any): PenggunaResponse {
        return {
            id: pengguna.id,
            username: pengguna.username,
            nama: pengguna.nama,
            role: pengguna.role,
            status: pengguna.status
        }
    }

    async penggunaMustExists(id: number, tx?: Prisma.TransactionClient): Promise<PenggunaResponse> {
        this.logger.debug(`Searching pengguna with id: ${id}`,{ context: this.ctx });
        const pengguna = await this.repo.findById(id, tx);
        if(!pengguna){
            this.logger.warn(`Pengguna with id: ${id} is not found`, { context: this.ctx });
            throw new HttpException('Pengguna not foud!', HttpStatus.NOT_FOUND);
        }

        return this.toPenggunaResponse(pengguna);
    }

    async checkUsername(
        username: string,
        tx?: Prisma.TransactionClient
    ): Promise<PenggunaResponse | null>{
        this.logger.debug(`Searching pengguna with username: ${username}`,{ context: this.ctx });
        const data = await this.repo.findByUsername(username, tx);
        if(!data){
            return null;
        }

        return this.toPenggunaResponse(data);
    }

    async createPengguna(
        data: PenggunaCreateDTO
    ): Promise<PenggunaResponse>{
        this.logger.info(`Starting create new pengguna with username: ${data.username}`,{ context: this.ctx });
        const role = await this.roleService.roleMustExists(data.roleId);
        const checkUsername = await this.checkUsername(data.username);
        if(checkUsername){
            this.logger.warn(`pengguna with username: ${data.username} has already exists`, { context: this.ctx });
            throw new HttpException('Username was already taken', HttpStatus.BAD_REQUEST);
        }
        data.roleId = role.id,
        data.password = await bcryptjs.hash(data.password, 10);
        const newPengguna = await this.repo.create(data);
        this.logger.info(`Pengguna with username ${data.username} was created successfully`,{ context: this.ctx });
        return this.toPenggunaResponse(newPengguna);
    }

    async updatePengguna(
        id: number,
        data: PenggunaUpdateDTO
    ): Promise<PenggunaResponse> {
        this.logger.info(`Starting update pengguna with id: ${id}`, {context: this.ctx});
        try {
            const updatedPengguna = await this.prisma.$transaction(
                async (tx) => {
                    const currentData = await this.penggunaMustExists(id, tx);
                    const role = await this.roleService.roleMustExists(data.roleId, tx);
                    if (data.username !== currentData.username){
                        const checkUsername = await this.checkUsername(data.username, tx);
                        if (checkUsername){
                            this.logger.warn(`username ${data.username} has already exist`,{context: this.ctx});
                            throw new HttpException('Username has already exists', HttpStatus.BAD_REQUEST);
                        }
                    }

                    const dataSender: PenggunaUpdateDTO = {
                        username: data.username,
                        nama: data.nama,
                        roleId: role.id
                    }
                    
                    const newData = await this.repo.update(currentData.id, dataSender, tx);
                    this.logger.info(`success updated data users with id: ${newData.id}`, {context: this.ctx})
                    return newData;
                }
            )
            return this.toPenggunaResponse(updatedPengguna);
        } catch (err){
            if (err instanceof HttpException){
                throw err
            }

            this.logger.error(`Unexpected error ${err.messsage}`,{context: this.ctx});
            throw new InternalServerErrorException('Terjadi Kesalahan di server')
        }
    }

    async resetPassword(
        id: number,
        data: ResetPasswordDTO
    ): Promise<PenggunaResponse> {
        this.logger.info(`starting reset password pengguna with id: ${id}`,{context: this.ctx});
        try {
            const updatedData = await this.prisma.$transaction(
                async (tx) => {
                    const currentData = await this.penggunaMustExists(id, tx);
                    const dataSender = {
                        password: await bcryptjs.hash(data.new_password, 10)
                    }

                    const newData = await this.repo.update(currentData.id, dataSender, tx);
                    this.logger.info(`success reset password pengguna id: ${id}`,{context: this.ctx});
                    return newData;
                }
            )

            return this.toPenggunaResponse(updatedData);
        } catch (err){
            if (err instanceof HttpException){
                throw err
            }

            this.logger.error(`Unexpected error ${err.messsage}`,{context: this.ctx});
            throw new InternalServerErrorException('Terjadi Kesalahan di server')
        }
    }

    async changeStatus(
        id: number,
    ): Promise<PenggunaResponse> {
        this.logger.info(`starting change status pengguna with id: ${id}`,{context: this.ctx});
        try {
            const updatedPengguna = await this.prisma.$transaction(
                async (tx) => {
                    const currentData = await this.penggunaMustExists(id, tx);
                    
                    const dataSender = {
                        status: !currentData.status
                    }

                    const newData = await this.repo.update(currentData.id, dataSender, tx);
                    this.logger.info(`Success change status pengguna with id: ${newData.id}`,{context: this.ctx});
                    return newData;
                }
            )

            return this.toPenggunaResponse(updatedPengguna);
        } catch (err){
            if (err instanceof HttpException){
                throw err
            }

            this.logger.error(`Unexpected error ${err.messsage}`,{context: this.ctx});
            throw new InternalServerErrorException('Terjadi Kesalahan di server')
        }
    }

    async removePengguna(
        id: number
    ): Promise<PenggunaResponse> {
        this.logger.info(`Starting delete pengguna with id: ${id}`,{context: this.ctx});
        const currentPengguna = await this.penggunaMustExists(id);
        const deletedPengguna = await this.repo.delete(currentPengguna.id);

        this.logger.info(`Pengguna with id: ${id} was deleted successfully`,{ context: this.ctx });
        return this.toPenggunaResponse(deletedPengguna);
    }

    async getAllPengguna(): Promise<PenggunaResponse[]>{
        this.logger.debug('Get all pengguna',{context: this.ctx});
        const listData = await this.repo.findAll();
        
        return listData.map((item) => this.toPenggunaResponse(item));
    }

    // untuk login
    async getByUsername(
        username: string
    ): Promise<Pengguna | null>{
        this.logger.debug(`get pengguna with username: ${username}`,{ context: this.ctx });
        
        const data = await this.repo.findByUsername(username);
        if(!data){
            return null;
        }

        return data;
    }

}