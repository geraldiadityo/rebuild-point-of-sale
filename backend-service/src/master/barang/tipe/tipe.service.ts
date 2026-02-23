import { HttpException, HttpStatus, Inject } from "@nestjs/common";
import { TipeRepository } from "./tipe.repository";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { Tipe } from "@prisma/client";
import { TipeCreateDTO, TipeResponse } from "./dto/tipe.model";

export class TipeService {
    private readonly ctx = 'TipeService';
    constructor(
        private readonly repo: TipeRepository,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {}

    private toTipeResponse(tipe: Tipe): TipeResponse {
        return {
            id: tipe.id,
            nama: tipe.nama
        }
    }

    async tipeMustExist(
        id: number
    ): Promise<TipeResponse> {
        this.logger.debug(`Searching tipe with id: ${id}`,{context: this.ctx});
        const data = await this.repo.findById(id);

        if(!data){
            this.logger.warn(`tipe with id: ${id} was not found!`, {context: this.ctx});
            throw new HttpException('tipe was not found!', HttpStatus.NOT_FOUND);
        }

        return this.toTipeResponse(data);
    }

    async checkName(
        nama: string
    ): Promise<TipeResponse | null>{
        this.logger.debug(`Searching tipe with name: ${nama}`,{context: this.ctx});
        const data = await this.repo.findByName(nama);
        
        if(!data){
            this.logger.warn(`tipe with name: ${nama}`,{context: this.ctx});
            return null;
        }

        return this.toTipeResponse(data);
    }

    async createTipe(
        data: TipeCreateDTO
    ): Promise<TipeResponse> {
        this.logger.info(`starting creating new tipe with name: ${data.nama}`, {context: this.ctx});
        const checkName = await this.checkName(data.nama);
        if(checkName){
            this.logger.warn(`tipe with name: ${data.nama} has already exists`,{context: this.ctx});
            throw new HttpException('Tipe has already exists', HttpStatus.BAD_REQUEST);
        }

        const newTipe = await this.repo.create(data);
        this.logger.info(`tipe with name ${newTipe.nama} was created successfully`,{context: this.ctx});

        return this.toTipeResponse(newTipe);
    }

    async updateTipe(
        id: number,
        data: TipeCreateDTO
    ): Promise<TipeResponse> {
        this.logger.info(`starting updating tipe with id: ${id}`,{context: this.ctx});
        const currentData = await this.tipeMustExist(id);
        
        if(data.nama !== currentData.nama){
            const checkName = await this.checkName(data.nama);
            if(checkName){
                this.logger.warn(`tipe with name: ${data.nama} has already exists`, {context: this.ctx});
                throw new HttpException('tipe has already exists', HttpStatus.BAD_REQUEST);
            }
        }

        const updatedTipe = await this.repo.update(currentData.id, data);
        this.logger.info(`tipe with id: ${id} was updated successfully`,{context: this.ctx});
        return this.toTipeResponse(updatedTipe);
    }

    async removeTipe(
        id: number
    ): Promise<TipeResponse> {
        this.logger.info(`starting deleting tipe with id: ${id}`, {context: this.ctx});
        const currentData = await this.tipeMustExist(id);
        
        const deletedTipe = await this.repo.delete(currentData.id);
        this.logger.info(`Tipe with id: ${id} was deleted successfully`, {context: this.ctx});
        return this.toTipeResponse(deletedTipe);
    }

    async getAll(): Promise<TipeResponse[]>{
        this.logger.debug(`Get all tipe`,{context: this.ctx});
        const listData = await this.repo.findAll();

        return listData.map((item) => this.toTipeResponse(item));
    }

}