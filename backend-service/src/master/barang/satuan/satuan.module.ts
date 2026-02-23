import { Module } from "@nestjs/common";
import { SatuanRepository } from "./satuan.repository";
import { SatuanService } from "./satuan.service";
import { SatuanController } from "./satuan.controller";

@Module({
    providers: [
        SatuanRepository,
        SatuanService
    ],
    controllers: [SatuanController],
    exports: [SatuanService]
})
export class SatuanModule {}