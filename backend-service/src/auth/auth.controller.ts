import { Body, Controller, HttpCode, Post, UseInterceptors } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SetAuthInteceptor } from "./interceptor/set-auth.interceptor";
import { LoginRequestDTO } from "./dto/auth.model";
import { ClearAuthCookieInterceptor } from "./interceptor/clear-auth.interceptor";
import { Throttle } from "@nestjs/throttler";
import { Public } from "src/common/public.decorator";

@Controller('/api/auth')
export class AuthController {
    constructor(
        private service: AuthService
    ) {}

    @Public()
    @Throttle({ default: { limit: 5, ttl: 10000 } })
    @UseInterceptors(SetAuthInteceptor)
    @Post('/login')
    @HttpCode(200)
    async login(
        @Body() request: LoginRequestDTO
    ) {
        const user = await this.service.validate(request);
        const token = await this.service.login(user);

        return {
            user: token.data,
            token: token.token,
            refreshToken: token.refreshToken
        }
    }

    @UseInterceptors(ClearAuthCookieInterceptor)
    @Post('/logout')
    @HttpCode(200)
    async logout(){
        return;
    }
}