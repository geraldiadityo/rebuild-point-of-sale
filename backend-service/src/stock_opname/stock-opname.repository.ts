import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/common/prisma.service";
import { CreateDetailData, CreateSesiOpnameData } from "./dto/stock-opname.model";
import { Item, Prisma, Stok_opname, Stok_opname_detail, StokOpnameStatus } from "@prisma/client";

type FindManyArgs = Parameters<PrismaService['stok_opname']['findMany']>[0];
export type FindAllStokOpnameArgs = {
    where?: Prisma.Stok_opnameWhereInput;
    orderBy?: Prisma.Stok_opnameOrderByWithRelationInput;
    take?: number;
    skip?: number;
}

@Injectable()
export class StokOpnameRepository {
    constructor(
        private prisma: PrismaService
    ) {}

    async findMany(args: FindManyArgs): Promise<Stok_opname[]> {
        return await this.prisma.stok_opname.findMany({
            ...args,
            include: {
                pengguna: {
                    select: {
                        id: true,
                        nama: true,
                        username: true,
                        role: true,
                        status: true
                    }
                }
            }
        });
    }

    async findAll(args: FindAllStokOpnameArgs): Promise<Stok_opname[]> {
        return await this.findMany(args);
    }

    async count(
        where?: Prisma.Stok_opnameWhereInput
    ): Promise<number> {
        return this.prisma.stok_opname.count({ where })
    };

    async findFullDetailById(
        id: number
    ): Promise<(Stok_opname & { Stok_opname_detail: (Stok_opname_detail & { item: Item })[] }) | null>{
        return this.prisma.stok_opname.findUnique({
            where: {
                id: id
            },
            include: {
                pengguna: {
                    select: {
                        id: true,
                        username: true,
                        nama: true,
                        role: true
                    }
                },
                Stok_opname_detail: {
                    include: {
                        item: true,
                    },
                    orderBy: {
                        item: {
                            nama_item: 'asc'
                        }
                    }
                }
            },
        })
    }

    async createSessionOpname(
        data: CreateSesiOpnameData,
        tx?: Prisma.TransactionClient
    ): Promise<Stok_opname> {
        const prismaClient = tx || this.prisma;
        return await prismaClient.stok_opname.create({
            data: data,
            include: {
                pengguna: {
                    select: {
                        id: true,
                        username: true,
                        nama: true,
                        role: true,
                        status: true
                    }
                }
            }
        })
    }
    async createManyDetail(
        data: CreateDetailData[],
        tx?: Prisma.TransactionClient
    ): Promise<Prisma.BatchPayload> {
        const prismaClient = tx || this.prisma;
        return await prismaClient.stok_opname_detail.createMany({
            data: data
        })
    };

    async updateDetailCount(
        opnameId: number,
        itemId: number,
        stock_real: number,
        tx?: Prisma.TransactionClient
    ): Promise<void> {
        const prismaClient = tx || this.prisma;

        await prismaClient.$executeRawUnsafe(`
            UPDATE "stok_opname_detail"
            SET
                "stock_real" = ${stock_real},
                "selisih" = ${stock_real} - "stock_system"
            WHERE "opnameId" = ${opnameId} AND "itemId" = ${itemId}
        `)
    }

    async findDiscrepancies(
        opnameId: number,
        tx?: Prisma.TransactionClient
    ): Promise<Stok_opname_detail[]> {
        const prismClient = tx || this.prisma;
        return await prismClient.stok_opname_detail.findMany({
            where: {
                opnameId: opnameId,
                selisih: {
                    not: 0
                },
                stock_real: {
                    not: null
                }
            }
        })
    }

    async updateSesiStatus(
        opnameId: number,
        status: StokOpnameStatus,
        tx?: Prisma.TransactionClient
    ): Promise<Stok_opname> {
        const prismaClient = tx || this.prisma;

        return await prismaClient.stok_opname.update({
            where: {
                id: opnameId,
            },
            data: {
                status: status,
                tanggal_selesai: new Date()
            }
        })
    }

    async findById(
        id: number
    ): Promise<Stok_opname | null> {
        return await this.prisma.stok_opname.findUnique({
            where: {
                id: id
            },
            include: {
                pengguna: {
                    select: {
                        id: true,
                        username: true,
                        nama: true,
                        role: true,
                        status: true
                    }
                }
            }
        })
    }
}