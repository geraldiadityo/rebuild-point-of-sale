import { Inject, Injectable } from "@nestjs/common";
import { CacheRepository } from "src/common/cache.repository";
import { ISatuanRepository } from "./interface/satuan.interface";
import { PrismaService } from "src/common/prisma.service";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { Satuan } from "@prisma/client";

@Injectable()
export class SatuanRepository extends CacheRepository implements ISatuanRepository {
    private readonly ctx = 'SatuanRepository';
    constructor(
        private prisma: PrismaService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {
        super()
    }

    protected getNamespace(): string {
        return 'satuan';
    }

    async create(data: { nama: string; }): Promise<Satuan> {
        const result = await this.prisma.satuan.create({
            data: data
        });

        await this.invalidateNamespace();
        return result;
    }

    async update(id: number, data: { nama: string; }): Promise<Satuan> {
        const result = await this.prisma.satuan.update({
            where: {
                id: id
            },
            data: data
        });

        await this.invalidateNamespace();
        return result;
    }

    async remove(id: number): Promise<Satuan> {
        const result = await this.prisma.satuan.delete({
            where: {
                id: id
            }
        })

        await this.invalidateNamespace();
        return result;
    }

    async findAll(): Promise<Satuan[]> {
        const cacheKey = this.getCacheKey('all');
        const cachedData = await this.keyv.get<Satuan[]>(cacheKey);
        if(cachedData){
            this.logger.debug('Fetching data from cache',{context: this.ctx});
            return cachedData;
        }

        this.logger.debug('Fetching data from database', {context: this.ctx});
        const dbData = await this.prisma.satuan.findMany();
        await this.keyv.set(cacheKey, dbData);
        return dbData;
    }

    async findById(id: number): Promise<Satuan | null> {
        return await this.prisma.satuan.findUnique({
            where: {
                id: id
            }
        });
    }

    async findByName(nama: string): Promise<Satuan | null> {
        return await this.prisma.satuan.findUnique({
            where: {
                nama: nama
            }
        })
    }
}
