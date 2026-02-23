import { Injectable } from "@nestjs/common";
import { Discount_code, Prisma } from "@prisma/client";
import { PrismaService } from "src/common/prisma.service";
import { DiscountCreateDTO } from "./dto/discount.model";


type FindManyArgs = Parameters<PrismaService['discount_code']['findMany']>[0];
export type FindAllDiscountArgs = {
    where?: Prisma.Discount_codeWhereInput;
    orderBy?: Prisma.Discount_codeOrderByWithRelationInput;
    take?: number;
    skip?: number;
}

@Injectable()
export class DiscountRepository {
    constructor(
        private readonly prisma: PrismaService
    ) {}

    async findMany(args: FindManyArgs): Promise<Discount_code[]>{
        return await this.prisma.discount_code.findMany({...args});
    }

    async findAll(
        args: FindAllDiscountArgs
    ): Promise<Discount_code[]> {
        return await this.findMany(args);
    }

    async findById(
        id: number
    ): Promise<Discount_code | null>{
        return await this.prisma.discount_code.findUnique({
            where: {
                id: id
            }
        })
    }

    async findByName(
        nama: string
    ): Promise<Discount_code | null>{
        return await this.prisma.discount_code.findUnique({
            where: {
                nama: nama
            }
        })
    }

    async create(
        data: DiscountCreateDTO
    ): Promise<Discount_code> {
        return await this.prisma.discount_code.create({
            data: data
        })
    }

    async update(
        id: number,
        data: Partial<Discount_code>
    ): Promise<Discount_code> {
        return await this.prisma.discount_code.update({
            where: {
                id: id
            },
            data: data
        })
    }

    async remove(
        id: number
    ): Promise<Discount_code> {
        return await this.prisma.discount_code.delete({
            where: {
                id: id
            }
        })
    }

    async countAll(
        where?: Prisma.Discount_codeWhereInput
    ): Promise<number> {
        return await this.prisma.discount_code.count({where});
    }

    async changeStatusByOccurs(): Promise<{count: number}> {
        const today = new Date();
        return await this.prisma.discount_code.updateMany({
            where: {
                AND: [
                    {
                        occurs_until: {
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