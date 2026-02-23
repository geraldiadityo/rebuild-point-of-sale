import { Module } from "@nestjs/common";
import { AttributeRepository } from "./attribute.repository";
import { AttributeService } from "./attribute.service";
import { AttributeController } from "./attribute.controller";

@Module({
    providers: [
        AttributeRepository,
        AttributeService
    ],
    controllers: [
        AttributeController
    ]
})
export class AttributeModule {}