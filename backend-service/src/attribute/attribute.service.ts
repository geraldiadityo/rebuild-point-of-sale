import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { AttributeRepository } from "./attribute.repository";
import { Attribute } from "@prisma/client";
import { AttributeCreateDto, AttributeResponse } from "./attribute.model";

@Injectable()
export class AttributeService {
    private readonly ctx = 'AttributeService';
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly repo: AttributeRepository
    ) {}

    private toAttributeResponse(attribute: Attribute): AttributeResponse {
        return {
            key: attribute.key,
            values: attribute.values
        }
    }

    private async checkKey(key: string): Promise<AttributeResponse | null> {
        this.logger.debug(`starting search key with name: ${key}`,{context: this.ctx});
        const data = await this.repo.findByKey(key);
        
        if(data){
            return this.toAttributeResponse(data);
        }

        return null
    }

    async keyMustExists(key: string): Promise<AttributeResponse>{
        const data = await this.checkKey(key);

        if(!data){
            this.logger.warn(`key is do not exists`, {contexxt: this.ctx});
            throw new HttpException('Key is not exists', HttpStatus.NOT_FOUND);
        }

        return this.toAttributeResponse(data)
    }

    async createAttribute(
        data: AttributeCreateDto
    ): Promise<AttributeResponse> {
        this.logger.info(`starting create attribute with key: ${data.key} with value: ${data.values}`,{context: this.ctx});
        const checkKey = await this.checkKey(data.key);
        
        if(checkKey){
            this.logger.warn(`this key: ${data.key} has already exists`,{context: this.ctx});
            throw new HttpException('Key has already exists', HttpStatus.BAD_REQUEST);
        }

        const newAttribute = await this.repo.create(data);
        this.logger.info(`successed create attribute with key: ${newAttribute.key} with values: ${newAttribute.values}`,{context: this.ctx});
        return this.toAttributeResponse(newAttribute);
    }

    async updateAttribute(
        data: AttributeCreateDto
    ): Promise<AttributeResponse> {
        this.logger.info(`staring update attribute with key: ${data.key}`,{context: this.ctx});
        const updatedData = await this.repo.update(data);
        this.logger.info('successed update attribute',{context: this.ctx});

        return this.toAttributeResponse(updatedData);
    }


    async removeAttribute(
        key: string
    ): Promise<Attribute>{
        this.logger.info(`starting remove attribute with key: ${key}`,{context: this.ctx});
        const currentData = await this.keyMustExists(key)
        const AttributeRemove = await this.repo.remove(currentData.key);

        this.logger.info(`successed remove attribute with key: ${key}`,{context: this.ctx});
        return this.toAttributeResponse(AttributeRemove);
    }

    async getAll(): Promise<AttributeResponse[]> {
        this.logger.debug(`get all attributes`,{context: this.ctx});
        const listData = await this.repo.findAll();

        return listData.map((item) => this.toAttributeResponse(item));
    }
}