import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { DiscountRepository } from "./discount.repository";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { Discount_code, Prisma, TipePemberitahuan } from "@prisma/client";
import { ChangeStatusRequest, DiscountCreateDTO, DiscountQueryOptionDTO, DiscountRequestCreateDTO, DiscountResponse } from "./dto/discount.model";
import { NotificationService } from "src/notification/notification.service";
import { UpsertNotificationDTO } from "src/notification/notification.model";

@Injectable()
export class DiscountService {
    private readonly ctx = 'DiscountService';
    constructor(
        private readonly repo: DiscountRepository,
        private readonly notificationService: NotificationService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {}

    private toDiscountResponse(data: Discount_code): DiscountResponse {
        return {
            id: data.id,
            nama: data.nama,
            price: data.price,
            occurs_until: data.occurs_until,
            status: data.status
        }
    }

    async discountMustExists(
        id: number
    ): Promise<DiscountResponse> {
        this.logger.debug(`searching data discount with id: ${id}`,{context: this.ctx});
        const data = await this.repo.findById(id);

        if(!data){
            this.logger.warn(`data discount with id: ${id} not found`, {context: this.ctx});
            throw new HttpException('data discount is not found', HttpStatus.NOT_FOUND);
        }

        return this.toDiscountResponse(data)
    }

    async checkName(
        nama: string
    ): Promise<DiscountResponse | null>{
        this.logger.debug(`searching data discount with name: ${nama}`,{context: this.ctx});
        const data = await this.repo.findByName(nama);
        if(!data){
            return null
        }

        return this.toDiscountResponse(data);
    }

    async createDiscount(
        data: DiscountRequestCreateDTO
    ): Promise<DiscountResponse> {
        this.logger.info(`starting create data discount with name: ${data.nama}`,{context: this.ctx});
        const checkName = await this.checkName(data.nama);
        if(checkName){
            this.logger.warn(`data discount with name: ${data.nama}`,{context: this.ctx});
            throw new HttpException('discount data with this name has already exists', HttpStatus.BAD_REQUEST);
        }

        const occursUntilConvert = new Date(data.occurs_until)
        occursUntilConvert.setHours(23,59,59,999);
        const dataSender: DiscountCreateDTO = {
            nama: data.nama,
            price: data.price,
            occurs_until: occursUntilConvert
        }

        const newDiscount = await this.repo.create(dataSender);
        this.logger.info(`create discount data with name: ${newDiscount.nama} was successfully`,{context: this.ctx});
        return this.toDiscountResponse(newDiscount);
    }

    async updateDiscount(
        id: number,
        data: DiscountRequestCreateDTO
    ): Promise<DiscountResponse> {
        this.logger.info(`starting update data discount with id: ${id}`,{context: this.ctx});
        const currentData = await this.discountMustExists(id);
        
        if(data.nama !== currentData.nama){
            const checkName = await this.checkName(data.nama);
            if (checkName){
                this.logger.warn(`data discount with name: ${data.nama} has already exists`,{context: this.ctx});
                throw new HttpException('data nama has already exists',HttpStatus.BAD_REQUEST);
            }
        }

        const occursUntilConvert = new Date(data.occurs_until);
        occursUntilConvert.setHours(23, 59, 59, 999);

        const dataSender: DiscountCreateDTO = {
            nama: data.nama,
            price: data.price,
            occurs_until: occursUntilConvert,
        };

        const updateDiscount = await this.repo.update(currentData.id, dataSender);
        this.logger.info(`data discount with id: ${currentData.id} was updated successfully`,{context: this.ctx});
        return this.toDiscountResponse(updateDiscount);
    }

    async removeDiscount(
        id: number
    ): Promise<DiscountResponse> {
        this.logger.info(`starting removed data discount with id: ${id}`,{context: this.ctx});
        const currentData = await this.discountMustExists(id);

        const removedDiscount = await this.repo.remove(currentData.id);

        return this.toDiscountResponse(removedDiscount);
    }

    async changeStatus(
        id: number,
        data: ChangeStatusRequest
    ): Promise<DiscountResponse> {
        this.logger.info(`starting change status discount`,{context: this.ctx});
        const currentData = await this.discountMustExists(id);
        const { status } = data;
        let realStatus = true;
        if (status === 'active'){
            realStatus = true
        } else if (status === 'deactive'){
            realStatus = false;
        } else {
            throw new HttpException('not accepted status',HttpStatus.BAD_REQUEST);
        }

        const dataSender = {
            status: realStatus
        };

        const newData = await this.repo.update(currentData.id, dataSender);
        this.logger.info('success change status discount',{context: this.ctx});

        return this.toDiscountResponse(newData);
    }

    async getAll(
        query: DiscountQueryOptionDTO
    ): Promise<{
        data: DiscountResponse[],
        meta: any
    }> {
        this.logger.debug('Get data discount with dynamic filter',{context: this.ctx});
        const {page, pageSize, keyword, orderByField, orderByDirection} = query;
        
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const direction = orderByDirection === 1 ? 'asc' : 'desc';
        const orderBy: Prisma.Discount_codeOrderByWithRelationInput = {
            [orderByField]: direction
        };

        const conditions: Prisma.Discount_codeWhereInput[] = [];
        
        if(keyword && keyword.trim() !== ''){
            conditions.push({
                OR: [
                    { nama: { contains: keyword, mode: 'insensitive' } }
                ]
            })
        }

        const where: Prisma.Discount_codeWhereInput = {
            AND: conditions
        };

        const [listData, totalItem] = await Promise.all([
            this.repo.findAll({
                where,
                orderBy,
                take,
                skip
            }),
            this.repo.countAll(where),
        ]);

        if(listData.length === 0){
            return {
                data: [],
                meta: {
                    totalItem: 0,
                    totalPage: 0,
                    currentPage: page
                }
            }
        }

        const totalPage = Math.ceil(totalItem/pageSize);
        
        return {
            data: listData.map((item) => this.toDiscountResponse(item)),
            meta: {
                totalItem: totalItem,
                totalPage: totalPage,
                currentPage: page
            }
        }
    }

    async getDiscByName(
        nama: string
    ): Promise<DiscountResponse> {
        this.logger.debug(`search cuppon with name: ${nama}`,{context: this.ctx});
        const today = new Date();
        const data = await this.checkName(nama);
        
        if(!data){
            this.logger.warn('cuppont not found',{context: this.ctx});
            throw new HttpException('Cuppon is not found',HttpStatus.NOT_FOUND);
        }

        if (today > data.occurs_until || data.status === false){
            this.logger.warn(`cuppon with name: ${nama} was expired`,{context: this.ctx});
            throw new HttpException('this cuppon was expired', HttpStatus.BAD_REQUEST);
        }

        return this.toDiscountResponse(data);
    }

    async changeStatusDisc(): Promise<void> {
        try {
            const now = new Date();
            // notification context
            const where: Prisma.Discount_codeWhereInput = {
                AND: [
                    {
                        occurs_until: {
                            lte: now
                        }
                    },
                    {
                        status: true
                    }
                ]
            }
            const cupponExpired = await this.repo.findAll({
                where: where
            });
            for (const cuppon of cupponExpired) {
                const tanggalExpired = cuppon.occurs_until.toISOString().split('T')[0];
                const pesan = `Cuppon diskon ${cuppon.nama} telah melewati batas waktu pada ${tanggalExpired}`
                const notifSender: UpsertNotificationDTO = {
                    tipe: TipePemberitahuan.KUPON_EXPIRED,
                    pesan: pesan,
                    refrensiId: cuppon.id
                }
                await this.notificationService.createNotification(notifSender);
            }
            const result = await this.repo.changeStatusByOccurs();
            
            if(result.count > 0){
                this.logger.info(`success to deactivate ${result.count} expired cuppon`, {context: this.ctx});
            } else {
                this.logger.info('no expired item found to deactivate',{context: this.ctx});
            }
        } catch (err){
            this.logger.error('Failed to expired "check expired promo" cron job',{context: this.ctx, error: err.stack})
        }
    }
}