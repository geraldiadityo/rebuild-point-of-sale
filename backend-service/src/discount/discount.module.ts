import { Module } from "@nestjs/common";
import { DiscountRepository } from "./discount.repository";
import { DiscountService } from "./discount.service";
import { DiscountController } from "./discount.controller";
import { NotificationModule } from "src/notification/notification.module";

@Module({
    imports: [
        NotificationModule,
    ],
    providers: [
        DiscountRepository,
        DiscountService
    ],
    controllers: [
        DiscountController
    ],
    exports: [
        DiscountService
    ]
})
export class DiscountModule {}