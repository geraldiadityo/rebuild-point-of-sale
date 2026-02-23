import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { Request } from "express";
import { PayloadDecoded } from "./dto/auth.model";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { KEYV_INSTANCE } from "src/common/keyv.provider";
import Keyv from "keyv";
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
        configService: ConfigService,
        @Inject(KEYV_INSTANCE) private keyv: Keyv
    ) {
        super({
            jwtFromRequest: (req: Request) => {
                if(req?.cookies?.token){
                    return req.cookies.token
                }
                return null
            },
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET_KEY','secretKey')
        });
    }

    async validate(payload: PayloadDecoded): Promise<any>{
        if(!payload.jti){
            throw new HttpException('Token is missing jwt ID (jti).', HttpStatus.UNAUTHORIZED);
        }
        const isDenied = await this.keyv.get(payload.jti);
        if(isDenied){
            throw new HttpException('Token has been revoked', HttpStatus.UNAUTHORIZED);
        }
        return {
            username: payload.username,
            userId: payload.sub,
            role: payload.role,
        }
    }
}