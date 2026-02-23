import { HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Pemberitahuan, Prisma } from "@prisma/client";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { NotificationResponse, UpsertNotificationDTO } from "./notification.model";
import { PrismaService } from "src/common/prisma.service";
import { NotificationRepository } from "./notification.repository";

@Injectable()
export class NotificationService {
    private readonly ctx = 'NotificationService';
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly repo: NotificationRepository,
        private prisma: PrismaService
    ) {}

    private toPemberitahuanResponse(data: Pemberitahuan): NotificationResponse {
        return {
            id: data.id,
            tipe: data.tipe,
            pesan: data.pesan
        }
    }

    async pemberitahunaMustExist(
        id:  number,
        tx?: Prisma.TransactionClient
    ): Promise<NotificationResponse> {
        this.logger.debug(`Search data notification with id: ${id}`,{context: this.ctx});
        const data = await this.repo.findById(id, tx);
        if (!data){
            this.logger.warn(`notification with id: ${id} is not found`,{context: this.ctx});
            throw new HttpException('Notification is not found', HttpStatus.NOT_FOUND);
        }

        return this.toPemberitahuanResponse(data)
    }

    async createNotification(
        data: UpsertNotificationDTO,
    ): Promise<NotificationResponse> {
        this.logger.info('starting create notification',{context: this.ctx});
        try {
            const newData = await this.prisma.$transaction(
                async (tx) => {
                    const newData = await this.repo.upsert(data, tx);
                    this.logger.info(`success create notification ${newData.tipe}`,{context: this.ctx});
                    return newData
                }
            )

            return this.toPemberitahuanResponse(newData)
        } catch (err){
            if (err instanceof HttpException){
                throw err
            }

            this.logger.error(`Unexpected error ${err}`,{context: this.ctx});
            throw new InternalServerErrorException('Terjadi Kesalahan diserver')
        }
    }

    async doneNotification(
        id: number
    ): Promise<NotificationResponse> {
        this.logger.info(`starting resolve notification with id: ${id}`,{context: this.ctx})
        const currentData = await this.pemberitahunaMustExist(id);
        const result = await this.repo.removeNotification(id);

        return this.toPemberitahuanResponse(result);
    }

    async getAll(): Promise<NotificationResponse[]> {
        const listData = await this.repo.findAll({});

        return listData.map((item) => this.toPemberitahuanResponse(item))
    }
}