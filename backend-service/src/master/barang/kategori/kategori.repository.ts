import { CacheRepository } from "src/common/cache.repository";
import { IKategoriRepository } from "./interface/kategori.interface";
import { PrismaService } from "src/common/prisma.service";
import { Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { Kategori } from "@prisma/client";

@Injectable()
export class KategoriRepository extends CacheRepository implements IKategoriRepository {
    private readonly ctx = 'KategoriRepository';
    constructor(
        private prisma: PrismaService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {
        super();
    }

    protected getNamespace(): string {
        return 'kategori';
    }

    async create(data: { nama: string; }): Promise<Kategori> {
        const result = await this.prisma.kategori.create({
            data: data
        });
        
        await this.invalidateNamespace();
        return result;
    }

    async update(id: number, data: { nama: string; }): Promise<Kategori> {
        const result = await this.prisma.kategori.update({
            where: {
                id: id
            },
            data: data
        });
        
        await this.invalidateNamespace();
        return result;
    }

    async delete(id: number): Promise<Kategori> {
        const result = await this.prisma.kategori.delete({
            where: {
                id: id
            }
        });

        await this.invalidateNamespace();
        return result;
    }

    async findAll(): Promise<Kategori[]> {
        const cacheKey = this.getCacheKey('all');
        const cachedData = await this.cache.get<Kategori[]>(cacheKey);
        if(cachedData){
            this.logger.debug('Fetching data from cache', {context: this.ctx});
            return cachedData
        }

        this.logger.debug('Fetching data from database', { context: this.ctx });
        const dbData = await this.prisma.kategori.findMany();
        await this.cache.set(cacheKey, dbData);

        return dbData;
    }

    async findById(id: number): Promise<Kategori | null> {
        return await this.prisma.kategori.findUnique({
            where: {
                id: id
            }
        })
    }

    async findByName(nama: string): Promise<Kategori | null> {
        return await this.prisma.kategori.findUnique({
            where: {
                nama: nama
            }
        })
    }
}