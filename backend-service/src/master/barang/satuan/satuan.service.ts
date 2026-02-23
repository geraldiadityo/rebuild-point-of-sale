import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { SatuanRepository } from "./satuan.repository";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { Satuan } from "@prisma/client";
import { SatuanCreateDTO, SatuanResponse } from "./dto/satuan.model";

@Injectable()
export class SatuanService {
    private readonly ctx = 'SatuanService';
    constructor(
        private readonly repo: SatuanRepository,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {}

    private toSatuanResponse(satuan: Satuan): SatuanResponse {
        return {
            id: satuan.id,
            nama: satuan.nama
        }
    }

    async satuanMustExist(
        id: number
    ): Promise<SatuanResponse>{
        this.logger.debug(`Searching satuan with id: ${id}`,{context: this.ctx});
        const data = await this.repo.findById(id);
        
        if(!data){
            this.logger.warn(`satuan with id: ${id}`, {context: this.ctx});
            throw new HttpException('Satuan Not Found!', HttpStatus.NOT_FOUND);
        }

        return this.toSatuanResponse(data);
    }

    async checkName(
        nama: string
    ): Promise<SatuanResponse | null>{
        this.logger.debug(`Searching satuan with name: ${nama}`,{contex: this.ctx});
        const data = await this.repo.findByName(nama);
        
        if(!data){
            return null;
        }

        return this.toSatuanResponse(data);
    }

    async createSatuan(
        data: SatuanCreateDTO
    ): Promise<SatuanResponse>{
        this.logger.info(`Starting create satuan with name: ${data.nama}`,{context: this.ctx});
        const checkName = await this.checkName(data.nama);
        if(checkName){
            this.logger.warn(`satuan with name ${data.nama} has already exists`, {context: this.ctx});
            throw new HttpException('Satuan name has already exists', HttpStatus.BAD_REQUEST);
        }
        
        const newSatuan = await this.repo.create(data);
        this.logger.info(`Satuan with name: ${newSatuan.nama} was created successfully`,{context: this.ctx});
        return this.toSatuanResponse(newSatuan);
    }

    async updateSatuan(
        id: number,
        data: SatuanCreateDTO
    ): Promise<SatuanResponse> {
        this.logger.info(`Starting updating satuan with id: ${id}`,{context: this.ctx});
        const currentSatuan = await this.satuanMustExist(id);
        
        if(data.nama !== currentSatuan.nama){
            const checkName = await this.checkName(data.nama);
            if(checkName){
                this.logger.warn(`satuan with name ${data.nama} has already exists`, {context: this.ctx});
                throw new HttpException('Satuan name has already exists', HttpStatus.BAD_REQUEST);
            }
        }

        const updatedSatuan = await this.repo.update(currentSatuan.id, data);
        this.logger.info(`Satuan with id: ${currentSatuan.id} was updated successfully`, {context: this.ctx});
        
        return this.toSatuanResponse(updatedSatuan);
    }

    async removeSatuan(
        id: number
    ): Promise<SatuanResponse> {
        this.logger.info(`Starting deleting satuan with id: ${id}`, {context: this.ctx});
        const currentSatuan = await this.satuanMustExist(id);

        const deletedSatuan = await this.repo.remove(currentSatuan.id);
        this.logger.info(`Satuan with id: ${currentSatuan.id} was deleted successfully`, {context: this.ctx});

        return this.toSatuanResponse(deletedSatuan);
    }

    async getAll(): Promise<SatuanResponse[]> {
        this.logger.debug('Get All list satuan', {context: this.ctx});
        const listData = await this.repo.findAll();

        return listData.map((item) => this.toSatuanResponse(item));
    }
}