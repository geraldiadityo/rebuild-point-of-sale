import { Module } from "@nestjs/common";
import { KategoriService } from "./kategori.service";
import { KategoriRepository } from "./kategori.repository";
import { KategoriController } from "./kategori.controller";

@Module({
    providers: [
        KategoriRepository,
        KategoriService,
    ],
    controllers: [KategoriController],
    exports: [
        KategoriService
    ]
})
export class KategoriModule {}