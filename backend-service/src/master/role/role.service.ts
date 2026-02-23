import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { RoleRepository } from "./role.repository";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { Prisma, Role } from "@prisma/client";
import { RoleCreateDTO, RoleResponse } from "./dto/role.model";

@Injectable()
export class RoleService {
    private readonly ctx = 'RoleService';
    constructor(
        private readonly repo: RoleRepository,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {}

    private toRoleResponse(role: Role): RoleResponse {
        return {
            id: role.id,
            nama: role.nama
        }
    }

    async roleMustExists(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<RoleResponse>{
        this.logger.debug(`Searcing role with id: ${id}`,{
            context: this.ctx
        });
        const role = await this.repo.findById(id, tx);
        if(!role){
            this.logger.warn(`role with id: ${id} is not found`,{
                context: this.ctx
            });
            throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
        }
        this.logger.debug(`Role with id: ${id} was found`,{
            context: this.ctx
        })

        return this.toRoleResponse(role);
    }

    async checkName(
        nama: string
    ): Promise<RoleResponse | null>{
        const data = await this.repo.findByName(nama);
        if(!data){
            return null
        }

        return this.toRoleResponse(data);
    }

    async createRole(
        data: RoleCreateDTO
    ): Promise<RoleResponse> {
        this.logger.info(`Starting create new role with name: ${data.nama}`,{
            context: this.ctx
        });
        const checkName = await this.checkName(data.nama);
        if(checkName){
            this.logger.warn(`${data.nama} has already exists`,{ context: this.ctx });
            throw new HttpException(`Role name has already exists`, HttpStatus.BAD_REQUEST);
        }
        
        const newRole = await this.repo.create(data);
        this.logger.info(`Role ${data.nama} was created successfully`,{ context: this.ctx });
        return this.toRoleResponse(newRole);
    }

    async updateRole(
        id: number,
        data: RoleCreateDTO
    ): Promise<RoleResponse>{
        this.logger.info(`starting update data role with id: ${id}`, { context: this.ctx });
        const currentData = await this.roleMustExists(id);
        if(data.nama !== currentData.nama){
            const checkName = await this.checkName(data.nama);
            if(checkName){
                this.logger.warn(`${data.nama} has already exists`,{ context: this.ctx });
                throw new HttpException('Role name has already exists', HttpStatus.BAD_REQUEST);
            }
        }

        const updateRole = await this.repo.update(currentData.id, data);
        this.logger.info(`Role with id: ${id} was updated successfully`, { context: this.ctx });
        return this.toRoleResponse(updateRole);
    }

    async removeRole(
        id: number
    ): Promise<RoleResponse> {
        this.logger.info(`Starting delete data role with id: ${id}`,{ context: this.ctx });
        const currentData = await this.roleMustExists(id);

        const deletedRole = await this.repo.delete(currentData.id);
        this.logger.info(`Role with id: ${id} was deleted successfully`,{ context: this.ctx });
        return this.toRoleResponse(deletedRole);
    }

    async getAll(): Promise<RoleResponse[]> {
        this.logger.debug('Get All Role',{ context: this.ctx });
        const listData = await this.repo.findAll();
        return listData.map((item) => this.toRoleResponse(item));
    }
}