import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { FastifyReply } from "fastify";
import { map, Observable, tap } from "rxjs";

@Injectable()
export class SetAuthInteceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        const res = context.switchToHttp().getResponse<FastifyReply>();

        return next.handle().pipe(
            tap((data) => {
                if(data?.token){
                    res.setCookie('token', data.token, {
                        httpOnly: true,
                        secure: false,
                        sameSite: 'lax',
                        maxAge: 1000 * 60 * 60 * 24,
                        path: '/'
                    });
                }

                if(data?.user){
                    res.setCookie('user', JSON.stringify(data.user), {
                        httpOnly: false,
                        secure: false,
                        sameSite: 'lax',
                        maxAge: 1000 * 60 * 60 * 24,
                        path: '/'
                    })
                }
            }),
            map(() => {
                return {
                    message: 'Login success',
                    data: true
                }
            })
        )
    }
}