import { createParamDecorator, ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";

export const Auth = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user || request.raw?.user;

        if(user){
            return user;
        } else {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }
    }
)