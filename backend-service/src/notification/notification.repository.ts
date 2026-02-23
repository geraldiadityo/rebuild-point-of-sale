import { Injectable } from "@nestjs/common";
import { Pemberitahuan, Prisma } from "@prisma/client";
import { PrismaService } from "src/common/prisma.service";
import { UpsertNotificationDTO } from "./notification.model";

type FindManyArgs = Parameters<PrismaService['pemberitahuan']['findMany']>[0];
type FindAllArgs = {
    where?: Prisma.PemberitahuanWhereInput;
    orderBy?: Prisma.PemberitahuanOrderByWithRelationInput;
}

@Injectable()
export class NotificationRepository {
    constructor(
        private prisma: PrismaService
    ) {}

    async upsert(data: UpsertNotificationDTO, tx?: Prisma.TransactionClient): Promise<Pemberitahuan> {
        const client = tx || this.prisma;
        return await client.pemberitahuan.upsert({
            where: {
                tipe_referensiId: {
                    tipe: data.tipe,
                    referensiId: data.refrensiId
                },
            },
            update: {},
            create: {
                tipe: data.tipe,
                pesan: data.pesan,
                referensiId: data.refrensiId
            }
        })
    }

    async findMany(args: FindManyArgs): Promise<Pemberitahuan[]> {
        return await this.prisma.pemberitahuan.findMany({
            ...args,
            orderBy: {
                created_at: 'desc'
            }
        })
    }

    async findAll(args: FindAllArgs): Promise<Pemberitahuan[]> {
        return await this.findMany(args);
    }

    async findById(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<Pemberitahuan | null> {
        const client = tx || this.prisma;
        return await client.pemberitahuan.findUnique({
            where: {id : id}
        });
    }

    async removeNotification(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<Pemberitahuan> {
        const client = tx || this.prisma;
        return await client.pemberitahuan.delete({
            where: { id: id }
        });
    }
}