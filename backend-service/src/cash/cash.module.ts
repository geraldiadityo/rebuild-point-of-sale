import { Module } from "@nestjs/common";
import { CashRepository } from "./cash.repository";
import { CashService } from "./cash.service";
import { CashController } from "./cash.controller";

@Module({
    providers: [
        CashRepository,
        CashService,
    ],
    controllers: [
        CashController
    ],
    exports: [
        CashService
    ]
})
export class CashModule {}