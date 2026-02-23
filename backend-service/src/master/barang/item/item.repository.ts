import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { CacheRepository } from "src/common/cache.repository";
import { IItemRepository } from "./interface/item.interface";
import { PrismaService } from "src/common/prisma.service";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { ItemCreateDTO, SkuDTO } from "./dto/item.model";
import { getAbbreviation } from "src/utils/helper";
import { Item, Prisma, PrismaClient } from "@prisma/client";

type FindManyItemArgs = Parameters<PrismaService['item']['findMany']>[0];
export type FindAllItemArgs = {
    where?: Prisma.ItemWhereInput;
    orderBy?: Prisma.ItemOrderByWithRelationInput;
    take?: number;
    skip?: number;
}
@Injectable()
export class ItemRepository extends CacheRepository implements IItemRepository {
    private readonly ctx = 'ItemRepository';
    constructor(
        private prisma: PrismaService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {
        super()
    }

    protected getNamespace(): string {
        return 'item';
    }

    async findByLastSkuPrefix(
        prefix: string,
        tx: Prisma.TransactionClient
    ): Promise<Item | null>{
        return tx.item.findFirst({
            where: {
                sku: {startsWith: prefix}
            },
            orderBy: {
                sku: 'desc'
            }
        })
    }

    async findById(id: number, tx?: Prisma.TransactionClient): Promise<Item | null> {
        const prismaClient = tx || this.prisma;
        return await prismaClient.item.findUnique({
            where: {
                id: id
            },
            include: {
                kategori: true,
                tipe: true
            }
        });
    }

    async findByName(nama_item: string, tx?: Prisma.TransactionClient): Promise<Item | null> {
        const prismaClient = tx || this.prisma;
        return await prismaClient.item.findUnique({
            where: {
                nama_item: nama_item
            },
            include: {
                kategori: true,
                tipe: true
            }
        });
    }

    async create(data: ItemCreateDTO): Promise<Item> {
        const result = await this.prisma.item.create({
            data: data,
            include: {
                kategori: true,
                tipe: true,
            }
        });

        await this.invalidateNamespace();
        return result;
    }

    async update(id: number, data: Partial<Item>, tx?: Prisma.TransactionClient): Promise<Item> {
        const prismaCient = tx || this.prisma;
        const result = await prismaCient.item.update({
            where: {
                id: id
            },
            data: data
        });

        await this.invalidateNamespace();
        return result;
    }

    async upsert(data: ItemCreateDTO, tx?: Prisma.TransactionClient): Promise<Item> {
        const prismaClient = tx || this.prisma;
        const result = await prismaClient.item.upsert({
            where: {
                nama_item: data.nama_item
            },
            update: {},
            create: data,
            include: {
                kategori: true,
                tipe: true
            }
        });

        await this.invalidateNamespace();
        return result;
    }

    async delete(id: number): Promise<Item> {
        const result = await this.prisma.item.delete({
            where: {
                id: id
            },
            include:{
                kategori: true,
                tipe: true
            }
        });

        await this.invalidateNamespace();
        return result;
    }

    async findMany(args: FindManyItemArgs): Promise<Item[]>{
        const cacheKey = this.getCacheKey(args);
        
        const cachedData = await this.keyv.get<Item[]>(cacheKey);
        
        if(cachedData){
            this.logger.debug(`Fetching data item from cache`,{context: this.ctx});
            return cachedData;
        }

        this.logger.debug('Fetching data from database', {context: this.ctx});
        const dbData = await this.prisma.item.findMany({
            ...args,
            include: {
                kategori: true,
                tipe: true
            }
        });

        await this.keyv.set(cacheKey, dbData);

        return dbData;
    }

    async findAll(args: FindAllItemArgs): Promise<Item[]> {
        return await this.findMany(args);
    }

    // async search(take: number, skip: number, keyword: string): Promise<Item[]> {
    //     return await this.findMany({
    //         where: {
    //             OR:[
    //                 {
    //                     nama_item: {
    //                         contains: keyword
    //                     }
    //                 },
    //                 {
    //                     barcode: {
    //                         contains: keyword
    //                     }
    //                 },
    //             ]
    //         },
    //         take: take,
    //         skip: skip,
    //         include: {
    //             kategori: true,
    //             tipe: true
    //         },
    //         orderBy: {
    //             nama_item: 'asc'
    //         }
    //     });
    // }

    async findByBarcode(barcode: string): Promise<Item | null> {
        return await this.prisma.item.findUnique({
            where: {
                barcode: barcode
            },
            include: {
                kategori: true,
                tipe: true
            }
        })
    }

    async findBySku(sku: string): Promise<Item | null> {
        return await this.prisma.item.findUnique({
            where: {
                sku: sku
            },
            include: {
                kategori: true,
                tipe: true
            }
        })
    }

    async countAll(where?: Prisma.ItemWhereInput): Promise<number> {
        return await this.prisma.item.count({ where });
    }
}