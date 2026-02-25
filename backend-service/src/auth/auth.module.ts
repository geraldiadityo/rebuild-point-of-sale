import { Module } from "@nestjs/common";
import { PenggunaModule } from "src/master/pengguna/pengguna.module";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { ClearAuthCookieInterceptor } from "./interceptor/clear-auth.interceptor";
import { JwtStrategy } from "./jwt.strategy";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Module({
    imports: [
        PenggunaModule,
    ],
    providers: [
        AuthService,
        ClearAuthCookieInterceptor,
        JwtStrategy,
        JwtAuthGuard,
    ],
    controllers: [
        AuthController
    ],
    exports: [
        AuthService,
        JwtAuthGuard
    ]
})
export class AuthModule {}