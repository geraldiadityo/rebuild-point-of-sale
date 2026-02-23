import { Module } from "@nestjs/common";
import { TipeRepository } from "./tipe.repository";
import { TipeService } from "./tipe.service";
import { TipeController } from "./tipe.controller";

@Module({
    providers: [
        TipeRepository,
        TipeService,
    ],
    controllers: [TipeController],
    exports: [TipeService]
})
export class TipeModule {}