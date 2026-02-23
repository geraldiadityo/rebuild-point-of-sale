import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";

import { map, mergeMap, Observable, tap } from "rxjs";
import { AuthService } from "../auth.service";
import { FastifyReply } from "fastify";

@Injectable()
export class ClearAuthCookieInterceptor implements NestInterceptor {
    constructor(
        private authService: AuthService
    ) {}
    private parseCookies(cookieHeader: string): Record<string, string>{
        if(!cookieHeader) return {};

        return cookieHeader.split(';').reduce((acc, cookie) => {
            const [name, value] = cookie.trim().split('=');
            acc[name] = decodeURIComponent(value);
            return acc;
        }, {});
    }
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        const res = context.switchToHttp().getResponse<FastifyReply>();
        const req = context.switchToHttp().getRequest();

        const token = this.parseCookies(req.headers.cookie)['token'];
        // console.log(token);
        return next.handle().pipe(
            // tap(async () => {
            //     if(token){
            //         await this.authService.logout(token);
            //     }
            //     res.clearCookie(`token`, {
            //         httpOnly: true,
            //         secure: false,
            //         sameSite: 'lax'
            //     })

            //     res.clearCookie('user',{
            //         httpOnly: false,
            //         secure: false,
            //         sameSite: 'lax'
            //     })
            // }),
            // map(() => {
            //     return {
            //         message: 'logout success',
            //         data: true
            //     }
            // })
            mergeMap(async () => {
                if(token){
                    await this.authService.logout(token);

                    res.clearCookie('token', {
                        httpOnly: true,
                        secure: false,
                        sameSite: 'lax',
                        path: '/'
                    });

                    res.clearCookie('user', {
                        httpOnly: false,
                        secure: false,
                        sameSite: 'lax',
                        path: '/'
                    });

                    return {
                        message: 'logout success',
                        data: true
                    }
                }
            })
        )
    }
}