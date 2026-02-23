import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { HttpException, HttpStatus, Inject, Injectable, NestMiddleware } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Cache } from "cache-manager";
import { PayloadDecoded } from "src/auth/dto/auth.model";
import { KEYV_INSTANCE } from "./keyv.provider";
import Keyv from "keyv";
import { FastifyReply } from "fastify";
@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(
        private jwtService: JwtService,
        @Inject(KEYV_INSTANCE) private keyv: Keyv
    ) {}

    private parseCookies(cookieHeader: string): Record<string, string>{
        if(!cookieHeader) return {};

        return cookieHeader.split(';').reduce((acc, cookie) => {
            const parts = cookie.trim().split("=");
            if (parts.length >= 2){
                const name = parts[0];
                const value = parts.slice(1).join("=");
                acc[name] = decodeURIComponent(value);
            }
            return acc;
        }, {} as Record<string, string>);
    }

    async use(req: any, res: FastifyReply, next: (error?: any) => void) {
        if (req.method === 'OPTIONS'){
            return next();
        }
        if (req.path === '/api/auth/login' && req.method === 'POST'){
            return next();
        }

        const barierToken: string = req.headers['authorization']?.split(' ')[1];
        const cookies = this.parseCookies(req.headers.cookie);
        const cookieToken = cookies['token'];
        const token = barierToken || cookieToken;
        
        if(!token){
            throw new HttpException('Invalid Token', HttpStatus.UNAUTHORIZED);
        }

        try {
            const decoded = this.jwtService.verify<PayloadDecoded>(token);
            if(!decoded){
                throw new HttpException('Token are not provided', HttpStatus.UNAUTHORIZED);
            }

            // check deny list di redis
            if(!decoded.jti){
                // token lama yang tidak memiliki uuid akan langsung di tolak
                throw new HttpException('Invalid token, (missing JTI)', HttpStatus.UNAUTHORIZED);
            }
            const isDenied = await this.keyv.get(decoded.jti);
            if(isDenied){
                throw new HttpException('Token has been revoked', HttpStatus.UNAUTHORIZED);
            }
            req.user = decoded;
            next();
        } catch(err) {
            throw new HttpException(err, HttpStatus.UNAUTHORIZED);
        }
    }
}