import { Module } from "@nestjs/common";
import { PenggunaModule } from "src/master/pengguna/pengguna.module";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { ClearAuthCookieInterceptor } from "./interceptor/clear-auth.interceptor";
import { JwtStrategy } from "./jwt.strategy";

@Module({
    imports: [
        PenggunaModule,
    ],
    providers: [
        AuthService,
        ClearAuthCookieInterceptor,
        JwtStrategy
    ],
    controllers: [
        AuthController
    ]
})
export class AuthModule {}