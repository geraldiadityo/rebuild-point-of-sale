import { CacheRepository } from "src/common/cache.repository";
import { IRoleRepository } from "./interface/role.interface";
import { PrismaService } from "src/common/prisma.service";
import { Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { Prisma, Role } from "@prisma/client";

@Injectable()
export class RoleRepository extends CacheRepository implements IRoleRepository {
    private readonly ctx = 'RoleRepository';
    constructor(
        private prisma: PrismaService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {
        super();
    }

    protected getNamespace(): string {
        return 'role';
    }

    async create(data: { nama: string; }): Promise<Role> {
        const result = await this.prisma.role.create({
            data: data
        });

        await this.invalidateNamespace();
        return result;
    }

    async update(id: number, data: { nama: string; }): Promise<Role> {
        const result = await this.prisma.role.update({
            where: {
                id: id
            },
            data: data
        });
        await this.invalidateNamespace();
        return result;
    }

    async delete(id: number): Promise<Role> {
        const result = await this.prisma.role.delete({
            where: {
                id: id
            }
        });
        await this.invalidateNamespace();
        return result;
    }

    async findAll(): Promise<Role[]> {
        const cacheKey = await this.getCacheKey('all');
        const cachedData = await this.keyv.get<Role[]>(cacheKey);
        if(cachedData){
            this.logger.debug('Fecthing data from Cache',{
                context: this.ctx
            });
            return cachedData;
        }
        this.logger.debug('Fetching data from database', {
            context: this.ctx
        });
        const dbData = await this.prisma.role.findMany();
        await this.keyv.set(cacheKey, dbData);
        return dbData;
    }

    async findById(id: number, tx?: Prisma.TransactionClient): Promise<Role | null> {
        const client = tx || this.prisma;
        return await client.role.findUnique({
            where: {
                id: id
            }
        })
    }

    async findByName(nama: string): Promise<Role | null> {
        return await this.prisma.role.findUnique({
            where: {
                nama: nama
            }
        })
    }
}