import { Inject, Injectable } from "@nestjs/common";
import { CacheRepository } from "src/common/cache.repository";
import { ISupplierRepository } from "./interface/supplier.interface";
import { PrismaService } from "src/common/prisma.service";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { Prisma, Supplier } from "@prisma/client";
import { SupplierDTO } from "./dto/supplier.model";

type FindManySupplierArgs = Parameters<PrismaService['supplier']['findMany']>[0];
export type FindAllSupplierArgs = {
    where?: Prisma.SupplierWhereInput;
    orderBy?: Prisma.SupplierOrderByWithRelationInput;
    take: number,
    skip: number
}

@Injectable()
export class SupplierRepository extends CacheRepository implements ISupplierRepository {
    private readonly ctx = 'SupplierRepository';
    constructor(
        private prisma: PrismaService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {
        super();
    }

    protected getNamespace(): string {
        return 'supplier';
    }

    async create(data: SupplierDTO): Promise<Supplier> {
        const result = await this.prisma.supplier.create({
            data: data
        });

        await this.invalidateNamespace();
        return result;
    }

    async update(id: number, data: SupplierDTO): Promise<Supplier> {
        const result = await this.prisma.supplier.update({
            where: {
                id: id
            },
            data: data
        });

        await this.invalidateNamespace();
        return result;
    }

    async delete(id: number): Promise<Supplier> {
        const result = await this.prisma.supplier.delete({
            where: {
                id: id
            }
        });

        await this.invalidateNamespace();
        return result;
    }

    async upsert(data: SupplierDTO, tx?: Prisma.TransactionClient): Promise<Supplier> {
        const prismaClient = tx || this.prisma;
        const result = await prismaClient.supplier.upsert({
            where: {
                nama_supplier: data.nama_supplier
            },
            update: {},
            create: {
                nama_supplier: data.nama_supplier,
                alamat: data.alamat,
                no_telp: data.no_telp,
                deskripsi: data.deskripsi
            }
        });

        await this.invalidateNamespace();
        return result;
    }

    async countAll(where?: Prisma.SupplierWhereInput): Promise<number> {
        return await this.prisma.supplier.count({where});
    }

    async findMany(args: FindManySupplierArgs): Promise<Supplier[]>{
        const cacheKey = this.getCacheKey(args);
        const cachedData = await this.keyv.get<Supplier[]>(cacheKey);

        if(cachedData){
            this.logger.debug('Fetching data from cache', {context: this.ctx});
            return cachedData;
        }

        this.logger.debug('Fetching data from database', {context: this.ctx});
        const dbData = await this.prisma.supplier.findMany(args);
        
        await this.keyv.set(cacheKey, dbData);
        return dbData;
    }

    async findAll(args: FindAllSupplierArgs): Promise<Supplier[]> {
        return await this.findMany(args);
    }

    async findById(id: number): Promise<Supplier | null> {
        return await this.prisma.supplier.findUnique({
            where: {
                id: id
            }
        })
    }

    async findByName(nama_supplier: string): Promise<Supplier | null> {
        return await this.prisma.supplier.findUnique({
            where: {
                nama_supplier: nama_supplier
            }
        })
    }
}