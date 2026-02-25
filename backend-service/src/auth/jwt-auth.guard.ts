import { ExecutionContext, HttpException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";
import { IS_PUBLIC_KEY } from "src/common/public.decorator";
import { FastifyReply } from "fastify";
import { PayloadDecoded } from "./dto/auth.model";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt'){
    constructor(
        private refrector:  Reflector,
        private authService: AuthService,
        private jwtService: JwtService,
    ) {
        super()
    }

    private parseCookies(cookieHeader: string): Record<string, string>{
        if(!cookieHeader) return {};

        return cookieHeader.split(';').reduce((acc, cookie) => {
            const [name, value] = cookie.trim().split('=');
            acc[name] = decodeURIComponent(value);
            return acc;
        }, {});
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.refrector.getAllAndOverride<boolean>(IS_PUBLIC_KEY,[
            context.getHandler(),
            context.getClass()
        ]);

        if(isPublic){
            return true
        }

        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse<FastifyReply>();

        try {
            const isActive = (await super.canActivate(context)) as boolean;
            return isActive;
        } catch (err){
            const cookies = this.parseCookies(request.headers.cookie);
            const refreshToken = cookies['refresh_token'];

            if (!refreshToken){
                throw err;
            }

            try {
                const {data, token, refreshToken: newRefreshToken} = await this.authService.regenerateToken(refreshToken);
                response.setCookie('token', token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 15 * 60 * 1000
                });
                
                response.setCookie('refresh_token', newRefreshToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 1000 * 60 * 60 * 24
                });

                response.setCookie('user', JSON.stringify(data),{
                    httpOnly: false,
                    secure: false,
                    sameSite: 'lax',
                    maxAge: 1000 * 60 * 60 * 24
                });

                const decoded = this.jwtService.verify<PayloadDecoded>(token);
                request.user = decoded;
                return true
            } catch (refreshErr){
                throw new UnauthorizedException('please login back')
            }
        }
    }
}