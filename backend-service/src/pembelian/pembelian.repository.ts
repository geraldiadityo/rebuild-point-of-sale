import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/common/prisma.service";
import {  TransaksiCreateDTO, TransaksiDetailCreateDTO, TransaksiDetailPayloadResponse } from "./dto/pembelian.model";
import { Pembelian, Pembelian_detail, Prisma } from "@prisma/client";

type FindManyArgs = Parameters<PrismaService['pembelian']['findMany']>[0];
export type FindAllPembelianArgs = {
    where?: Prisma.PembelianWhereInput;
    orderBy?: Prisma.PembelianOrderByWithRelationInput;
    take?: number;
    skip?: number;
}
@Injectable()
export class PembelianRepository {
    constructor(
        private prisma: PrismaService
    ) {}

    
    async findMany(args: FindManyArgs): Promise<Pembelian[]>{
        return await this.prisma.pembelian.findMany({
            ...args,
            include: {
                supplier: true
            }
        })
    }


    async findById(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<Pembelian | null>{
        const prismaClient = tx || this.prisma;
        return await prismaClient.pembelian.findUnique({
            where: {
                id: id
            },
            include: {
                supplier: true
            }
        });
    }

    async findByNoFaktur(
        no_faktur: string,
        tx?: Prisma.TransactionClient
    ): Promise<Pembelian | null>{
        const prismaClient = tx || this.prisma;
        return await prismaClient.pembelian.findUnique({
            where: {
                no_faktur: no_faktur
            },
            include: {
                supplier: true
            }
        });
    }

    async createTransaksi(
        data: TransaksiCreateDTO,
        tx?: Prisma.TransactionClient
    ): Promise<Pembelian> {
        const prismaClient = tx || this.prisma;
        return await prismaClient.pembelian.create({
            data: data,
            include: {
                supplier: true
            }
        });
    }

    async createDetailTransaksiMany(
        data: TransaksiDetailCreateDTO[],
        tx?: Prisma.TransactionClient
    ): Promise<TransaksiDetailPayloadResponse>{
        const prismaClient = tx || this.prisma;
        
        return await prismaClient.pembelian_detail.createMany({
            data: data
        });
    }

    async updateAfterCreate(
        id: number,
        data: Partial<Pembelian>,
        tx?: Prisma.TransactionClient
    ): Promise<Pembelian>{
        const prismaClient = tx || this.prisma;
        return await prismaClient.pembelian.update({
            where: {
                id: id,
            },
            data: data,
            include: {
                supplier: true
            }
        });
    }

    async updateDetailTransaksi(
        id: number,
        data: Partial<Pembelian_detail>,
        tx?: Prisma.TransactionClient
    ): Promise<void> {
        const prismaClient = tx || this.prisma;

        await prismaClient.pembelian_detail.update({
            where: {
                id: id
            },
            data: data
        })
    }

    async updateBilling(
        id: number,
        bayar: number
    ): Promise<Pembelian>{
        return this.prisma.$transaction(async (tx) => {
            const [pembelian] = await tx.$queryRawUnsafe<Pembelian[]>(`
                select * from pembelian_barang
                where id = ${id}
                for update
            `);

            if(pembelian.sisa_pembayaran - bayar < 0){
                throw new HttpException('something error with input bayar', HttpStatus.BAD_REQUEST);
            }

            const newBilling = pembelian.sisa_pembayaran - bayar;
            if(newBilling === 0){
                return await tx.pembelian.update({
                    where: {
                        id: id
                    },
                    data: {
                        sisa_pembayaran: newBilling,
                        status: true
                    },
                    include: {
                        supplier: true
                    }
                })
            } else {
                return await tx.pembelian.update({
                    where: {
                        id: id
                    },
                    data: {
                        sisa_pembayaran: newBilling
                    },
                    include: {
                        supplier: true
                    }
                })
            }
        });
    }

    async findAllPembelian(
        args: FindAllPembelianArgs
    ): Promise<Pembelian[]>{
        return await this.findMany(args);
    }

    async countAll(where?: Prisma.PembelianWhereInput): Promise<number>{
        return await this.prisma.pembelian.count({where});
    }

    async getDetailById(
        pembelianId: number,
        tx?: Prisma.TransactionClient
    ): Promise<Pembelian_detail[]>{
        const prismaClient = tx || this.prisma
        return await prismaClient.pembelian_detail.findMany({
            where: {
                pembelianId: pembelianId
            },
            select: {
                id: true,
                pembelianId: true,
                itemSatuanId: true,
                item_satuan: {
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
                                        nama: true,
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
                        qty_price: true,
                        convert_item: true,
                    }
                },
                qty: true,
                harga_beli: true,
                tanggal: true,
            },
            orderBy: {
                id: 'asc'
            }
        });
    }

    async deleteDetail(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<Pembelian_detail> {
        const prismaClient = tx || this.prisma;
        
        return await prismaClient.pembelian_detail.delete({
            where: {
                id:id
            },
            select: {
                id: true,
                pembelianId: true,
                itemSatuanId: true,
                item_satuan: {
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
                                        nama: true,
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
                        qty_price: true,
                        convert_item: true,
                    }
                },
                qty: true,
                harga_beli: true,
                tanggal: true,
            },
        })
    }

    // async filterByStatus(
    //     take: number,
    //     skip: number,
    //     status: boolean
    // ): Promise<Pembelian[]>{
    //     return await this.prisma.pembelian.findMany({
    //         where: {
    //             AND: [
    //                 {
    //                     deleted_at: null,
    //                 },
    //                 {
    //                     status: status
    //                 }
    //             ]
    //         },
    //         take: take,
    //         skip: skip,
    //         orderBy: {
    //             tanggal: 'desc'
    //         },
    //         include: {
    //             supplier: true
    //         }
    //     })
    // }

    async countByStatus(
        status: boolean
    ): Promise<number>{
        return await this.prisma.pembelian.count({
            where: {
                AND: [
                    {
                        deleted_at: null
                    },
                    {
                        status: status
                    }
                ]
            }
        })
    }

    async removeTransaksi(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<void>{
        const prismaClient = tx || this.prisma;
        const today = new Date();
        await prismaClient.pembelian.update({
            where: {
                id: id
            },
            data: {
                deleted_at: today
            }
        })
    }

    async findDetailByItemId(
        itemId: number,
        endDate?: Date,
        tx?: Prisma.TransactionClient
    ): Promise<Pembelian_detail[]> {
        const prismaClient = tx || this.prisma;
        return prismaClient.pembelian_detail.findMany({
            where: {
                AND: [
                    {
                        item_satuan: {
                            itemId: itemId
                        }
                    },
                    {
                        tanggal: {
                            lte: endDate
                        }
                    }
                ]
            },
            select: {
                id: true,
                pembelianId: true,
                itemSatuanId: true,
                item_satuan: {
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
                                        nama: true,
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
                        qty_price: true,
                        convert_item: true,
                    }
                },
                qty: true,
                harga_beli: true,
                tanggal: true,
            },
        })
    }
}