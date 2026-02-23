import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/common/prisma.service";
import { CashCreateDTO, CashMutationCreateDTO, CashMutationDTO } from "./cash.model";
import { Cash, Cash_mutation, Prisma } from "@prisma/client";

type FindManyCashMutationArgs = Parameters<PrismaService['cash_mutation']['findMany']>[0];
export type FindAllCashMutationArgs = {
    where?: Prisma.Cash_mutationWhereInput;
    orderBy?: Prisma.Cash_mutationOrderByWithRelationInput;
    take?: number;
    skip?: number;
}
@Injectable()
export class CashRepository {
    constructor(
        private prisma: PrismaService
    ) {}

    async create(data: CashCreateDTO): Promise<Cash> {
        return await this.prisma.cash.create({
            data: data
        });
    }

    async update(
        id: number,
        data: Partial<Cash>,
        tx?: Prisma.TransactionClient
    ): Promise<Cash> {
        const prismaClient = tx || this.prisma;

        return await prismaClient.cash.update({
            where: {
                id: id
            },
            data: data
        });
    }

    async remove(
        id: number
    ): Promise<Cash> {
        return await this.prisma.cash.delete({
            where: {
                id: id
            }
        });
    }

    async getAll(): Promise<Cash[]> {
        return await this.prisma.cash.findMany();
    }

    async getByName(
        cash_name: string
    ): Promise<Cash | null>{
        return await this.prisma.cash.findUnique({
            where: {
                cash_name: cash_name
            }
        })
    }

    async getById(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<Cash | null> {
        const prismaClient = tx || this.prisma
        return await prismaClient.cash.findUnique({
            where: {
                id: id
            }
        })
    }

    async createCashMutation(
        data: CashMutationDTO,
        tx?: Prisma.TransactionClient
    ): Promise<Cash_mutation>{
        const prismaClient = tx || this.prisma;
        return await prismaClient.cash_mutation.create({
            data: data,
            select: {
                id: true,
                cashId: true,
                cash: {
                    select: {
                        id: true,
                        cash_name: true,
                        values: true,
                    }
                },
                type: true,
                saldo_awal: true,
                keterangan: true,
                value: true,
                saldo_akhir: true,
                tanggal: true,
                penggunaId: true,
                pengguna: {
                    select: {
                        id: true,
                        username: true,
                        nama: true,
                        roleId: true,
                        role: {
                            select: {
                                id: true,
                                nama: true,
                            }
                        },
                        status: true
                    }
                },
                shift: true
            }
        })
    };

    async cashMutationFindMany(args: FindManyCashMutationArgs): Promise<Cash_mutation[]>{
        return await this.prisma.cash_mutation.findMany({
            ...args,
            select: {
                id: true,
                cashId: true,
                cash: {
                    select: {
                        id: true,
                        cash_name: true,
                        values: true,
                    }
                },
                type: true,
                saldo_awal: true,
                keterangan: true,
                value: true,
                saldo_akhir: true,
                tanggal: true,
                penggunaId: true,
                pengguna: {
                    select: {
                        id: true,
                        username: true,
                        nama: true,
                        roleId: true,
                        role: {
                            select: {
                                id: true,
                                nama: true,
                            }
                        },
                        status: true
                    }
                },
                shift: true
            }
        })
    };

    async cashMutationFindAll(args: FindAllCashMutationArgs): Promise<Cash_mutation[]>{
        return await this.cashMutationFindMany(args);
    }
    
    async cashMutationCount(where?: Prisma.Cash_mutationWhereInput): Promise<number> {
        return await this.prisma.cash_mutation.count({where});
    }

    async getMutationById(
        id: number
    ): Promise<Cash_mutation | null>{
        return await this.prisma.cash_mutation.findUnique({
            where: {
                id: id
            },
            include: {
                cash: true
            }
        })
    }
}