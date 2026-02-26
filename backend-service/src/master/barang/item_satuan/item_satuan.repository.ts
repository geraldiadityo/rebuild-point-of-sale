import { Inject, Injectable } from "@nestjs/common";
import { CacheRepository } from "src/common/cache.repository";
import { ISatuanItemRepository } from "./interface/item_satuan.interface";
import { PrismaService } from "src/common/prisma.service";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { Item_satuan, Prisma } from "@prisma/client";
import { ItemSatuanRequest } from "./dto/item_satuan.model";

type FindManyItemSatuanArgs = Parameters<PrismaService['item_satuan']['findMany']>[0];
@Injectable()
export class ItemSatuanRepository extends CacheRepository implements ISatuanItemRepository {
    private readonly ctx = 'ItemSatuanRepository';
    constructor(
        private prisma: PrismaService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {
        super();
    }

    protected getNamespace(): string {
        return 'item-satuan';
    }

    async create(data: ItemSatuanRequest, tx?: Prisma.TransactionClient): Promise<Item_satuan> {
        const prismaClient = tx || this.prisma;
        const result = await prismaClient.item_satuan.create({
            data: data,
            select: {
                id: true,
                itemId: true,
                item: {
                    select: {
                        id: true,
                        barcode: true,
                        sku: true,
                        nama_item: true,
                        kategoriId: true,
                        kategori: {
                            select: {
                                id: true,
                                nama: true
                            }
                        },
                        tipeId: true,
                        tipe: {
                            select: {
                                id: true,
                                nama: true
                            }
                        },
                        deskripsi: true
                    }
                },
                satuanId: true,
                satuan: {
                    select: {
                        id: true,
                        nama: true
                    }
                },
                convert_item: true,
                qty_price: true
            }
        });
        
        await this.invalidateNamespace();
        return result;
    }

    async update(id: number, data: ItemSatuanRequest): Promise<Item_satuan> {
        const result = await this.prisma.item_satuan.update({
            where: {
                id: id
            },
            data: data,
            select: {
                id: true,
                itemId: true,
                item: {
                    select: {
                        id: true,
                        barcode: true,
                        sku: true,
                        nama_item: true,
                        kategoriId: true,
                        kategori: {
                            select: {
                                id: true,
                                nama: true
                            }
                        },
                        tipeId: true,
                        tipe: {
                            select: {
                                id: true,
                                nama: true
                            }
                        },
                        deskripsi: true
                    }
                },
                satuanId: true,
                satuan: {
                    select: {
                        id: true,
                        nama: true
                    }
                },
                convert_item: true,
                qty_price: true
            }
        });

        await this.invalidateNamespace();
        return result;
    }

    async remove(id: number): Promise<Item_satuan> {
        const result = await this.prisma.item_satuan.delete({
            where: {
                id: id
            },
            select: {
                id: true,
                itemId: true,
                item: {
                    select: {
                        id: true,
                        barcode: true,
                        sku: true,
                        nama_item: true,
                        kategoriId: true,
                        kategori: {
                            select: {
                                id: true,
                                nama: true
                            }
                        },
                        tipeId: true,
                        tipe: {
                            select: {
                                id: true,
                                nama: true
                            }
                        },
                        deskripsi: true
                    }
                },
                satuanId: true,
                satuan: {
                    select: {
                        id: true,
                        nama: true
                    }
                },
                convert_item: true,
                qty_price: true
            }
        });

        await this.invalidateNamespace();
        return result;
    }

    async findMany(args: FindManyItemSatuanArgs): Promise<Item_satuan[]>{
        const cacheKey = this.getCacheKey(args);
        const cachedData = await this.cache.get<Item_satuan[]>(cacheKey);

        if(cachedData){
            this.logger.debug(`fetching data from cached`,{context: this.ctx});
            return cachedData;
        }

        this.logger.debug('fetching data from database', {context: this.ctx});
        const dbData = await this.prisma.item_satuan.findMany(args);
        await this.cache.set(cacheKey, dbData);

        return dbData;
    }

    async findByItem(itemId: number): Promise<Item_satuan[]> {
        return await this.findMany({
            where: {
                itemId: itemId
            },
            select: {
                id: true,
                itemId: true,
                item: {
                    select: {
                        id: true,
                        barcode: true,
                        sku: true,
                        nama_item: true,
                        kategoriId: true,
                        kategori: {
                            select: {
                                id: true,
                                nama: true
                            }
                        },
                        tipeId: true,
                        tipe: {
                            select: {
                                id: true,
                                nama: true
                            }
                        },
                        deskripsi: true
                    }
                },
                satuanId: true,
                satuan: {
                    select: {
                        id: true,
                        nama: true
                    }
                },
                convert_item: true,
                qty_price: true
            },
            orderBy: {
                id: 'asc'
            }
        });
    }

    async findAll(take: number, skip: number): Promise<Item_satuan[]> {
        return await this.findMany({
            take: take,
            skip: skip,
            select: {
                id: true,
                itemId: true,
                item: {
                    select: {
                        id: true,
                        barcode: true,
                        sku: true,
                        nama_item: true,
                        kategoriId: true,
                        kategori: {
                            select: {
                                id: true,
                                nama: true
                            }
                        },
                        tipeId: true,
                        tipe: {
                            select: {
                                id: true,
                                nama: true
                            }
                        },
                        deskripsi: true
                    }
                },
                satuanId: true,
                satuan: {
                    select: {
                        id: true,
                        nama: true
                    }
                },
                convert_item: true,
                qty_price: true
            }
        });
    }

    async findById(id: number): Promise<Item_satuan | null> {
        return await this.prisma.item_satuan.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                itemId: true,
                item: {
                    select: {
                        id: true,
                        barcode: true,
                        sku: true,
                        nama_item: true,
                        kategoriId: true,
                        kategori: {
                            select: {
                                id: true,
                                nama: true
                            }
                        },
                        tipeId: true,
                        tipe: {
                            select: {
                                id: true,
                                nama: true
                            }
                        },
                        deskripsi: true
                    }
                },
                satuanId: true,
                satuan: {
                    select: {
                        id: true,
                        nama: true
                    }
                },
                convert_item: true,
                qty_price: true
            }
        });
    }

    async findByItemAndSatuan(itemId: number, satuanId: number, tx?: Prisma.TransactionClient): Promise<Item_satuan | null> {
        const prismaClient = tx || this.prisma;
        return await prismaClient.item_satuan.findFirst({
            where: {
                AND: [
                    {
                        itemId: itemId,
                    },
                    {
                        satuanId: satuanId
                    }
                ]
            },
            select: {
                id: true,
                itemId: true,
                item: {
                    select: {
                        id: true,
                        barcode: true,
                        sku: true,
                        nama_item: true,
                        kategoriId: true,
                        kategori: {
                            select: {
                                id: true,
                                nama: true
                            }
                        },
                        tipeId: true,
                        tipe: {
                            select: {
                                id: true,
                                nama: true
                            }
                        },
                        deskripsi: true
                    }
                },
                satuanId: true,
                satuan: {
                    select: {
                        id: true,
                        nama: true
                    }
                },
                convert_item: true,
                qty_price: true
            }
        });
    }

    async countAll(): Promise<number> {
        return await this.prisma.item_satuan.count();
    }
}