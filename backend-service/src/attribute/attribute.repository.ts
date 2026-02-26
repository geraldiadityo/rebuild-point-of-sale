import { Inject, Injectable } from "@nestjs/common";
import { Attribute } from "@prisma/client";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { CacheRepository } from "src/common/cache.repository";
import { PrismaService } from "src/common/prisma.service";
import { Logger } from "winston";

@Injectable()
export class AttributeRepository extends CacheRepository {
    private readonly ctx = 'AttributeRepository';
    constructor(
        private prisma: PrismaService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {
        super();
    }

    protected getNamespace(): string {
        return 'attribute';
    }

    async create(
        data: { key: string, values: string }
    ): Promise<Attribute> {
        const result = await this.prisma.attribute.create({
            data: data
        });

        await this.invalidateNamespace();
        
        return result;
    }

    async update(
        data: { key: string, values: string }
    ): Promise<Attribute> {
        const result = await this.prisma.attribute.upsert({
            where: {
                key: data.key
            },
            create: {
                key: data.key,
                values: data.values
            },
            update: {
                values: data.values
            }
        });

        await this.invalidateNamespace();

        return result;
    }

    async remove(
        key: string
    ): Promise<Attribute> {
        const result = await this.prisma.attribute.delete({
            where: {
                key: key
            }
        });

        await this.invalidateNamespace();

        return result;
    }

    async findAll(): Promise<Attribute[]> {
        const cacheKey = this.getCacheKey('all');
        const cachedData = await this.cache.get<Attribute[]>(cacheKey);
        
        if(cachedData){
            this.logger.debug('fetching data from cached', {context: this.ctx});
            return cachedData
        }

        this.logger.debug('fetching data from database', {context: this.ctx});
        const dbData = await this.prisma.attribute.findMany();
        await this.cache.set(cacheKey, dbData);

        return dbData;
    }


    async findByKey(
        key: string
    ): Promise<Attribute | null>{
        return await this.prisma.attribute.findUnique({
            where: {
                key: key
            }
        });
    }


}