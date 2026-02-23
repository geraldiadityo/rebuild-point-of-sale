import { Module } from "@nestjs/common";
import { RoleModule } from "../role/role.module";
import { PenggunaRepository } from "./pengguna.repository";
import { PenggunaService } from "./pengguna.service";
import { PenggunaController } from "./pengguna.controller";

@Module({
    imports: [
        RoleModule
    ],
    providers: [
        PenggunaRepository,
        PenggunaService,
    ],
    controllers: [
        PenggunaController
    ],
    exports: [
        PenggunaService
    ]
})
export class PenggunaModule {}