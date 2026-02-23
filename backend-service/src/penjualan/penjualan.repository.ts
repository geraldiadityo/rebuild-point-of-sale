import { Injectable } from "@nestjs/common";
import { Keranjang, Penjualan, Penjualan_detail, Prisma } from "@prisma/client";
import { PrismaService } from "src/common/prisma.service";
import { KeranjangInsert, KeranjangResPayload, KeranjangResponse, NoKeranjangWithItemCount, PenjualanCreate, PenjualanDetailCreate, PenjualanDetailResPayload, PenjualanDetailResponse } from "./dto/penjualan.dto";
import { RlabaKotor } from "src/reporting/dto/reporting.model";


type FindManyArgs = Parameters<PrismaService['penjualan']['findMany']>[0];
export type FindAllPenjualanArgs = {
    where?: Prisma.PenjualanWhereInput;
    orderBy?: Prisma.PenjualanOrderByWithRelationInput;
    take?: number;
    skip?: number;
}
@Injectable()
export class PenjualanRepository {
    constructor(
        private prisma: PrismaService
    ) {}

    async findMany(args: FindManyArgs): Promise<Penjualan[]>{
        return await this.prisma.penjualan.findMany({
            ...args,
            select: {
                id: true,
                tanggal: true,
                invoice: true,
                total: true,
                discount: true,
                grand_total: true,
                bayar: true,
                tipe_pembayaran: true,
                kembalian: true,
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
                                nama: true
                            }
                        }
                    }
                },
                delete_at: true,
                external_id: true
            }
        })
    }

    async findAll(args: FindAllPenjualanArgs): Promise<Penjualan[]> {
        return await this.findMany(args);
    }

    async findById(id: number): Promise<Penjualan | null>{
        return await this.prisma.penjualan.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                tanggal: true,
                invoice: true,
                total: true,
                discount: true,
                grand_total: true,
                bayar: true,
                tipe_pembayaran: true,
                kembalian: true,
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
                                nama: true
                            }
                        }
                    }
                },
                delete_at: true,
                external_id: true
            }
        })
    }

    async findByExternalId(
        external_id: string,
        tx?: Prisma.TransactionClient
    ): Promise<Penjualan | null>{
        const client = tx || this.prisma;
        return await client.penjualan.findUnique({
            where: { external_id: external_id },
            select: {
                id: true,
                tanggal: true,
                invoice: true,
                total: true,
                discount: true,
                grand_total: true,
                bayar: true,
                tipe_pembayaran: true,
                kembalian: true,
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
                                nama: true
                            }
                        }
                    }
                },
                delete_at: true,
                external_id: true
            }
        })
    }

    async countAll(where?: Prisma.PenjualanWhereInput): Promise<number>{
        return await this.prisma.penjualan.count({where});
    }

    async findLastInvoiceToday(
        date: Date,
        tx?: Prisma.TransactionClient
    ): Promise<Penjualan | null>{
        const prismaClient = tx || this.prisma;
        const startDate = new Date(date);
        const endDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23,59,59,999);
        
        return await prismaClient.penjualan.findFirst({
            where: {
                tanggal: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: {
                invoice: 'desc'
            }
        })
    }

    async createPenjualan(
        data: PenjualanCreate,
        tx?: Prisma.TransactionClient
    ): Promise<Penjualan> {
        const prismaClient = tx || this.prisma;
        return await prismaClient.penjualan.create({
            data: data,
            select: {
                id: true,
                tanggal: true,
                invoice: true,
                total: true,
                discount: true,
                grand_total: true,
                bayar: true,
                tipe_pembayaran: true,
                kembalian: true,
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
                                nama: true
                            }
                        }
                    }
                },
                delete_at: true,
                external_id: true
            }
        })
    }

    async updateAfterCreate(
        id: number,
        data: Partial<Penjualan>,
        tx?: Prisma.TransactionClient
    ): Promise<Penjualan>{
        const prismaClient = tx || this.prisma;
        
        return await prismaClient.penjualan.update({
            where: {
                id: id
            },
            data: data,
            select: {
                id: true,
                tanggal: true,
                invoice: true,
                total: true,
                discount: true,
                grand_total: true,
                bayar: true,
                tipe_pembayaran: true,
                kembalian: true,
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
                                nama: true
                            }
                        }
                    }
                },
                delete_at: true,
                external_id: true
            }
        })
    }

    async createManyPenjualanDetail(
        data: PenjualanDetailCreate[],
        tx?: Prisma.TransactionClient
    ): Promise<PenjualanDetailResPayload> {
        const prismaClient = tx || this.prisma;

        return await prismaClient.penjualan_detail.createMany({
            data: data
        });
    }

    async findDetailByIdPenjualan(
        penjualanId: number
    ): Promise<Penjualan_detail[]>{
        return await this.prisma.penjualan_detail.findMany({
            where: {
                penjualanId: penjualanId
            },
            select: {
                id: true,
                penjualanId: true,
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
                        convert_item: true
                    }
                },
                harga: true,
                qty: true,
                tanggal: true
            }
        });
    }

    async findDetailByTanggal(
        startDate: Date,
        endDate: Date,
        tx?: Prisma.TransactionClient
    ): Promise<Penjualan_detail[]> {
        const prismaClient = tx || this.prisma;
        return await prismaClient.penjualan_detail.findMany({
            where: {
                tanggal: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: {
                id: true,
                penjualanId: true,
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
                        convert_item: true
                    }
                },
                harga: true,
                qty: true,
                tanggal: true
            }
        })
    }

    async findKeranjangByNo(
        no_keranjang: string,
        tx?: Prisma.TransactionClient
    ): Promise<Keranjang[]>{
        const prismaClient = tx || this.prisma;
        return await prismaClient.keranjang.findMany({
            where: {
                no_keranjang: no_keranjang
            },
            select: {
                id: true,
                no_keranjang: true,
                itemId: true,
                itemSatuanId: true,
                item_satuan: {
                    select: {
                        id: true,
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
                                }
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
                        qty_price: true,
                    }
                },
                harga: true,
                qty: true
            },
        });
    }

    async getListKeranjangWithItemCount(): Promise<NoKeranjangWithItemCount[]>{
        return await this.prisma.$queryRawUnsafe<NoKeranjangWithItemCount[]>(`
            SELECT "no_keranjang", COUNT("no_keranjang") AS "jumlah_item"
            FROM "keranjang"
            GROUP BY "no_keranjang"
        `);
    }

    async insertManyKeranjang(
        data: KeranjangInsert[],
        tx?: Prisma.TransactionClient
    ): Promise<KeranjangResPayload> {
        const prismaClient = tx || this.prisma;

        return await prismaClient.keranjang.createMany({
            data: data
        });
    }

    async deleteManyKeranjang(
        no_keranjang: string,
        tx?: Prisma.TransactionClient
    ): Promise<KeranjangResPayload>{
        const prismaClient = tx || this.prisma;

        return await prismaClient.keranjang.deleteMany({
            where: {
                no_keranjang: no_keranjang
            }
        })
    }

    async findLastNumberKeranjang(
        tx?: Prisma.TransactionClient
    ): Promise<Keranjang | null>{
        const prismaClient = tx || this.prisma;

        return await prismaClient.keranjang.findFirst({
            orderBy: {
                no_keranjang: 'desc'
            }
        });
    }

    async getLabaKotorAggregate(
        startDate: Date,
        endDate: Date
    ): Promise<RlabaKotor[]> {
        const result = await this.prisma.$queryRaw<any[]>`
            SELECT
                DATE(p.tanggal) as tanggal,
                CAST(COALESCE(SUM(pd.qty * pd.harga), 0::bigint) AS INTEGER) AS sub_total,
                CAST(COALESCE(SUM(pd.qty * COALESCE(i.avg_cost, 0)), 0::bigint) AS INTEGER) AS total_pokok,
                CAST(
                    COALESCE(SUM(pd.qty * pd.harga), 0::bigint) -
                    COALESCE(SUM(pd.qty * COALESCE(i.avg_cost, 0)), 0::bigint)
                AS INTEGER) as laba_kotor
            FROM penjualan_barang p
            JOIN penjualan_detail_barang pd ON p.id = pd."penjualanId"
            JOIN item_satuan_barang isb ON pd."itemSatuanId" = isb.id
            JOIN item_barang i ON isb."itemId" = i.id
            WHERE p.tanggal >= ${startDate}
                AND p.tanggal <= ${endDate}
                AND p.delete_at IS NULL
            GROUP BY DATE(p.tanggal)
            ORDER BY DATE(p.tanggal) ASC
        `;

        return result.map(row => ({
            tanggal: typeof row.tanggal === 'string' ? new Date(row.tanggal) : row.tanggal,
            sub_total: Number(row.sub_total),
            total_pokok: Number(row.total_pokok),
            laba_kotor: Number(row.laba_kotor)
        }));
    }

    async getSumPenjualanDate(startDate: Date, endDate: Date): Promise<number> {
        const result = await this.prisma.penjualan.aggregate({
            _sum: {
                grand_total: true
            },
            where: {
                tanggal: {
                    gte: startDate,
                    lte: endDate
                },
                delete_at: null
            },
        });

        return result._sum.grand_total || 0;
    }
}