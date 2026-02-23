import { Module } from "@nestjs/common";
import { NotificationRepository } from "./notification.repository";
import { NotificationService } from "./notification.service";
import { NotificationController } from "./notification.controller";

@Module({
    providers: [
        NotificationRepository,
        NotificationService,
    ],
    controllers: [
        NotificationController
    ],
    exports: [
        NotificationService
    ]
})
export class NotificationModule {}