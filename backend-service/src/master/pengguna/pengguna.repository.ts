import { CacheRepository } from "src/common/cache.repository";
import { IPenggunaRepository } from "./interface/pengguna.interface";
import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "src/common/prisma.service";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { Pengguna, Prisma } from "@prisma/client";

type FindManyPenggunaArgs = Parameters<PrismaService['pengguna']['findMany']>[0];
@Injectable()
export class PenggunaRepository extends CacheRepository implements IPenggunaRepository {
    private readonly ctx = 'PenggunaRepository';
    constructor(
        private prisma: PrismaService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {
        super();
    }

    protected getNamespace(): string {
        return 'pengguna';
    }

    async create(data: { username: string; nama: string; roleId: number; password: string; }): Promise<Pengguna> {
        const result = await this.prisma.pengguna.create({
            data: data,
            include: {
                role: true
            }
        });

        await this.invalidateNamespace();
        return result;
    }

    async update(id: number,data: Partial<Pengguna>, tx?: Prisma.TransactionClient): Promise<Pengguna> {
        const client = tx || this.prisma;
        const result = await client.pengguna.update({
            where: {
                id: id
            },
            data: data,
            include: {
                role: true
            }
        });

        await this.invalidateNamespace();
        return result;
    }

    async delete(id: number): Promise<Pengguna> {
        const today = new Date()
        const result = await this.prisma.pengguna.update({
            where: {
                id: id
            },
            data: {
                deleted_at: today
            },
            include: {
                role: true
            }
        });

        await this.invalidateNamespace();
        return result;
    }

    async findMany(args: FindManyPenggunaArgs): Promise<Pengguna[]>{
        const cacheKey = await this.getCacheKey(args);
        const cachedData = await this.keyv.get<Pengguna[]>(cacheKey);
        if(cachedData){
            this.logger.debug('Fetching data from cache',{ context: this.ctx });
            return cachedData;
        }

        this.logger.debug('Fetching data from database', { context: this.ctx });
        const dbData = await this.prisma.pengguna.findMany(args);
        await this.keyv.set(cacheKey, dbData);

        return dbData;
    }

    async findAll(): Promise<Pengguna[]> {
        return await this.findMany({
            where: {
                deleted_at: null,
            },
            include: {
                role: true
            }
        });
    }

    async findById(id: number, tx?: Prisma.TransactionClient): Promise<Pengguna | null> {
        const client = tx || this.prisma;
        return await client.pengguna.findUnique({
            where: {
                id: id
            },
            include: {
                role: true
            }
        })
    }

    async findByUsername(username: string, tx?: Prisma.TransactionClient): Promise<Pengguna | null> {
        const client = tx || this.prisma;
        return await client.pengguna.findUnique({
            where: {
                username: username
            },
            include: {
                role: true
            }
        })
    }

}