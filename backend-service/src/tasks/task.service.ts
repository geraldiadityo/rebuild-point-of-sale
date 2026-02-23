import { Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { DiscountService } from "src/discount/discount.service";
import { InventoryService } from "src/inventory/inventory.service";
import { Logger } from "winston";
import { Cron, CronExpression } from '@nestjs/schedule';
@Injectable()
export class TaskService {
    private readonly ctx = 'TaskService';
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly inventoryService: InventoryService,
        private readonly discountService: DiscountService,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
        name: 'checkExpiredInventory',
        timeZone: 'Asia/Jakarta'
    })
    async handleExpiredInventory(){
        this.logger.info('starting task job "check Expired Inventory and discount" running...',{context: this.ctx});
        await this.inventoryService.changeStatusByExpired();
        await this.discountService.changeStatusDisc();
    }

}