import { Inject, Injectable } from "@nestjs/common";
import { CacheRepository } from "src/common/cache.repository";
import { ITipeRepository } from "./interface/tipe.interface";
import { PrismaService } from "src/common/prisma.service";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { Tipe } from "@prisma/client";

@Injectable()
export class TipeRepository extends CacheRepository implements ITipeRepository {
    private readonly ctx = 'TipeRepository';
    constructor(
        private prisma: PrismaService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {
        super();
    }

    protected getNamespace(): string {
        return 'tipe';
    }

    async create(data: { nama: string; }): Promise<Tipe> {
        const result = await this.prisma.tipe.create({
            data: data
        });

        await this.invalidateNamespace();
        return result;
    }

    async update(id: number, data: { nama: string; }): Promise<Tipe> {
        const result = await this.prisma.tipe.update({
            where: {
                id: id
            },
            data: data
        });

        await this.invalidateNamespace();
        return result;
    }

    async delete(id: number): Promise<Tipe> {
        const result = await this.prisma.tipe.delete({
            where: {
                id: id
            }
        });

        await this.invalidateNamespace();
        return result;
    }

    async findAll(): Promise<Tipe[]> {
        const cacheKey = this.getCacheKey('all');
        const cachedData = await this.keyv.get<Tipe[]>(cacheKey);

        if(cachedData){
            this.logger.debug('Fetching data from cache', {context: this.ctx});
            return cachedData;
        }

        this.logger.debug('Fetching data from database',{context: this.ctx});
        const dbData = await this.prisma.tipe.findMany();
        await this.keyv.set(cacheKey, dbData);
        return dbData;
    }

    async findById(id: number): Promise<Tipe | null> {
        return await this.prisma.tipe.findUnique({
            where: {
                id: id
            }
        });
    }

    async findByName(nama: string): Promise<Tipe | null> {
        return await this.prisma.tipe.findUnique({
            where: {
                nama: nama
            }
        });
    }
}