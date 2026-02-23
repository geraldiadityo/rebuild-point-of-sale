import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { KategoriRepository } from "./kategori.repository";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { Kategori } from "@prisma/client";
import { KategoriCreateDTO, KategoriResponse } from "./dto/kategori.model";

@Injectable()
export class KategoriService {
    private readonly ctx = 'KategoriService';
    constructor(
        private readonly repo: KategoriRepository,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {}

    private toKategoriResponse(kategori: Kategori): KategoriResponse {
        return {
            id: kategori.id,
            nama: kategori.nama
        }
    }

    async kategoriMustExists(id: number): Promise<KategoriResponse>{
        this.logger.debug(`Searching kategori with id: ${id}`, {context: this.ctx});
        const data = await this.repo.findById(id);

        if(!data){
            this.logger.warn(`kategori with id: ${id} is not found!`,{context: this.ctx});
            throw new HttpException('Kategori not found!', HttpStatus.NOT_FOUND);
        }

        return this.toKategoriResponse(data);
    }

    async checkName(
        nama: string
    ): Promise<KategoriResponse | null>{
        this.logger.debug(`Searching kategori with name: ${nama}`,{context: this.ctx});
        const data = await this.repo.findByName(nama);
        if(!data){
            return null;
        }

        return this.toKategoriResponse(data);
    }

    async createKategori(
        data: KategoriCreateDTO
    ): Promise<KategoriResponse>{
        this.logger.info(`starting create new kategori with name: ${data.nama}`,{context: this.ctx});
        const checkName = await this.checkName(data.nama);
        
        if(checkName){
            this.logger.warn(`kategori with name ${data.nama} has already exists`, {context: this.ctx});
            throw new HttpException('Name Kategori has already exists', HttpStatus.BAD_REQUEST);
        }
        
        const newKategori = await this.repo.create(data);
        this.logger.info(`Kategori with name: ${data.nama} was created successfully`,{context: this.ctx});
        return this.toKategoriResponse(newKategori);
    }

    async updateKategori(
        id: number,
        data: KategoriCreateDTO
    ): Promise<KategoriResponse>{
        this.logger.info(`Starting update kategori with id: ${id}`, {context: this.ctx});
        const currentData = await this.kategoriMustExists(id);
        if(data.nama !== currentData.nama){
            const checkName = await this.checkName(data.nama);
            if(checkName){
                this.logger.warn(`Kategori with name ${data.nama} has already exists`, {context: this.ctx});
                throw new HttpException('Kategori name already exists', HttpStatus.BAD_REQUEST);
            }
        }
        const updatedKategori = await this.repo.update(currentData.id, data);
        this.logger.info(`Kategori with id: ${currentData.id} was successfully updated`, {context: this.ctx});
        return this.toKategoriResponse(updatedKategori);
    }

    async removeKategori(
        id: number
    ): Promise<KategoriResponse>{
        this.logger.info(`Starting deleted kategori with id: ${id}`,{context: this.ctx});
        const currentData = await this.kategoriMustExists(id);
        const deletedKategori = await this.repo.delete(currentData.id);

        this.logger.info(`Kategori with id: ${currentData.id} was deleted successfully`,{context: this.ctx});
        return this.toKategoriResponse(deletedKategori);
    }

    async getAll(): Promise<KategoriResponse[]>{
        this.logger.debug('Get All Kategori',{context: this.ctx});
        const listData = await this.repo.findAll();

        return listData.map((item) => this.toKategoriResponse(item));
    }

}