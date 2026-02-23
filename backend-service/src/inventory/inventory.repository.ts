import { PrismaService } from "src/common/prisma.service";
import { IInvetoryRepository } from "./interface/inventory.interface";
import { Inventory, Prisma } from "@prisma/client";
import { InventoryDTO, InventoryManyPayload, StokSumRawRes } from "./dto/inventory.model";
import { Injectable } from "@nestjs/common";

type FindManyArgs = Parameters<PrismaService['inventory']['findMany']>[0];
export type FindAllIventoryArgs = {
    where?: Prisma.InventoryWhereInput;
    orderBy?: Prisma.InventoryOrderByWithRelationInput;
    take?: number;
    skip?: number;
}
@Injectable()
export class InventoryRepository implements IInvetoryRepository {
    constructor(
        private prisma: PrismaService
    ) {}

    async create(data: InventoryDTO, tx?: Prisma.TransactionClient): Promise<Inventory> {
        const prismaClient = tx || this.prisma;
        return await prismaClient.inventory.create({
            data: data,
            select: {
                id: true,
                itemId: true,
                item: {
                    select: {
                        id: true,
                        sku: true,
                        barcode: true,
                        nama_item: true,
                        kategori: {
                            select: {
                                id: true,
                                nama: true
                            }
                        },
                        tipe: {
                            select: {
                                id: true,
                                nama: true
                            }
                        },
                        deskripsi: true
                    }
                },
                stok: true,
                tanggal_terima: true,
                expired_date: true,
                status: true,
                deleted_at: true,
                transaction_type: true
            }
        });
    }

    async createMany(data: InventoryDTO[], tx?: Prisma.TransactionClient): Promise<InventoryManyPayload> {
        const prismaClient = tx || this.prisma;
        return await prismaClient.inventory.createMany({
            data: data
        });
    }

    async remove(id: number, tx?: Prisma.TransactionClient): Promise<Inventory> {
        const today = new Date();
        const prismaClient = tx || this.prisma;
        return await prismaClient.inventory.update({
            where: {
                id: id
            },
            data: {
                deleted_at: today
            },
            select: {
                id: true,
                itemId: true,
                item: {
                    select: {
                        id: true,
                        sku: true,
                        barcode: true,
                        nama_item: true,
                        kategori: {
                            select: {
                                id: true,
                                nama: true
                            }
                        },
                        tipe: {
                            select: {
                                id: true,
                                nama: true
                            }
                        },
                        deskripsi: true
                    }
                },
                stok: true,
                tanggal_terima: true,
                expired_date: true,
                status: true,
                deleted_at: true,
                transaction_type: true
            }
        })
    }

    async findMany(args: FindManyArgs): Promise<Inventory[]>{
        return await this.prisma.inventory.findMany({
            ...args,
            select: {
                id: true,
                itemId: true,
                item: {
                    select: {
                        id: true,
                        sku: true,
                        barcode: true,
                        nama_item: true,
                        kategori: {
                            select: {
                                id: true,
                                nama: true
                            }
                        },
                        tipe: {
                            select: {
                                id: true,
                                nama: true
                            }
                        },
                        deskripsi: true
                    }
                },
                stok: true,
                tanggal_terima: true,
                expired_date: true,
                status: true,
                deleted_at: true,
                transaction_type: true
            }
        });
    }

    async findAll(args: FindAllIventoryArgs): Promise<Inventory[]> {
        return await this.findMany(args)
    }

    async findBySku(sku: string): Promise<Inventory[]> {
        return await this.prisma.inventory.findMany({
            where: {
                AND: [
                    {
                        deleted_at: null,
                    },
                    {
                        item: {
                            sku: sku
                        }
                    }
                ]
            },
            select: {
                id: true,
                itemId: true,
                item: {
                    select: {
                        id: true,
                        sku: true,
                        barcode: true,
                        nama_item: true,
                        kategori: {
                            select: {
                                id: true,
                                nama: true
                            }
                        },
                        tipe: {
                            select: {
                                id: true,
                                nama: true
                            }
                        },
                        deskripsi: true
                    }
                },
                stok: true,
                tanggal_terima: true,
                expired_date: true,
                status: true,
                deleted_at: true,
                transaction_type: true
            },
            orderBy: {
                tanggal_terima: 'desc'
            }
        });
    }

    async findById(id: number): Promise<Inventory | null> {
        return await this.prisma.inventory.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                itemId: true,
                item: {
                    select: {
                        id: true,
                        sku: true,
                        barcode: true,
                        nama_item: true,
                        kategori: {
                            select: {
                                id: true,
                                nama: true
                            }
                        },
                        tipe: {
                            select: {
                                id: true,
                                nama: true
                            }
                        },
                        deskripsi: true
                    }
                },
                stok: true,
                tanggal_terima: true,
                expired_date: true,
                status: true,
                deleted_at: true,
                transaction_type: true
            },
        })
    }

    async findByItemIdAndTanggal(itemId: number, tanggal: Date, tx?: Prisma.TransactionClient): Promise<Inventory | null> {
        const prismaClient = tx || this.prisma;
        return await prismaClient.inventory.findFirst({
            where: {
                AND: [
                    {
                        itemId: itemId
                    },
                    {
                        tanggal_terima: tanggal
                    }
                ]
            },
            orderBy: {
                tanggal_terima: 'asc'
            },
            select: {
                id: true,
                itemId: true,
                item: {
                    select: {
                        id: true,
                        sku: true,
                        barcode: true,
                        nama_item: true,
                        kategori: {
                            select: {
                                id: true,
                                nama: true
                            }
                        },
                        tipe: {
                            select: {
                                id: true,
                                nama: true
                            }
                        },
                        deskripsi: true
                    }
                },
                stok: true,
                tanggal_terima: true,
                expired_date: true,
                status: true,
                deleted_at: true,
                transaction_type: true
            },
        })
    }

    async sumStokBySkus(itemIds: number[]): Promise<StokSumRawRes[]> {
        if(itemIds.length === 0){
            return [];
        }

        // const result = await this.prisma.$queryRaw<StokSumRawRes[]>`
        //     SELECT
        //         "sku",
        //         SUM("stok") as total_stok
        //         FROM "inventory_ledger"
        //         WHERE "sku" = ANY(${skus}) and "status" = true and "deleted_at" = null
        //         GROUP BY "sku"
        // `;

        const skuListString = itemIds.map(sku => `${sku}`).join(',');
        // console.log(skuListString)
        const result = await this.prisma.$queryRawUnsafe<StokSumRawRes[]>(`
            select "itemId", sum("stok") as total_stok from "inventory_ledger"
            where "itemId" in(${skuListString}) and "status" = true and "deleted_at" is null
            group by "itemId"
        `)
        // console.log(result)

        return result;
    }

    async countAll(where?: Prisma.InventoryWhereInput): Promise<number> {
        return await this.prisma.inventory.count({where});
    }

    async findAndLockOneByItemId(itemId: number, qty: number, tx?: Prisma.TransactionClient): Promise<Inventory | null> {
        const prismaClient = tx || this.prisma;

        const result = await prismaClient.$queryRawUnsafe<Inventory[]>(`
            SELECT * FROM "inventory_ledger"
            WHERE
                "itemId" = ${itemId}
                AND "stok" >= ${qty}
                AND "deleted_at" IS NULL
            ORDER BY
                CASE
                    WHEN "expired_date" IS NULL THEN 1
                    ELSE 0
                END,
                "expired_date" ASC,
                "tanggal_terima" ASC
            LIMIT 1
            FOR UPDATE
        `);

        return result.length > 0 ? result[0] : null;
    }

    async updateStok(
        id: number,
        newStok: number,
        tx?: Prisma.TransactionClient
    ): Promise<Inventory> {
        const prismaClient = tx || this.prisma;

        return await prismaClient.inventory.update({
            where: {
                id: id
            },
            data: {
                stok: newStok
            }
        })
    }

    async changeStatusByExpired(): Promise<{ count: number; }> {
        const today = new Date();
        return await this.prisma.inventory.updateMany({
            where: {
                AND: [
                    {
                        expired_date: {
                            lte: today
                        }
                    },
                    {
                        status: true
                    }
                ]
            },
            data: {
                status: false
            }
        })
    }

}