import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { PenggunaResponse } from "src/master/pengguna/dto/pengguna.model";
import { PenggunaService } from "src/master/pengguna/pengguna.service";
import { Logger } from "winston";
import * as bcryptjs from 'bcryptjs';
import { LoginResponse, PayloadDecoded } from "./dto/auth.model";
import { v4 as uuidv4 } from 'uuid';
import { KEYV_INSTANCE } from "src/common/keyv.provider";
import Keyv from "keyv";
@Injectable()
export class AuthService {
    private readonly ctx = 'AuthService';
    constructor(
        private penggunaService: PenggunaService,
        private jwtService: JwtService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        @Inject(KEYV_INSTANCE) private keyv: Keyv
    ) {}

    async validate(
        data: { username: string, password: string },
    ): Promise<PenggunaResponse> {
        this.logger.debug(`Searching user with username ${data.username}`,{ context: this.ctx });
        const user = await this.penggunaService.getByUsername(data.username);
        if(!user){
            this.logger.warn(`user with username ${data.username} is not found!`,{ context: this.ctx });
            throw new HttpException('Username or Password is invalid', HttpStatus.UNAUTHORIZED);
        }

        if(!bcryptjs.compareSync(data.password, user.password)){
            this.logger.warn('password is invalid', { context: this.ctx });
            throw new HttpException('Username or Password is invalid', HttpStatus.UNAUTHORIZED);
        }

        const validateUser = await this.penggunaService.penggunaMustExists(user.id);
        return validateUser;
    }

    async login(
        user: PenggunaResponse
    ): Promise<LoginResponse>{
        this.logger.debug('starting sign user', { context: this.ctx });
        const payload = {
            username: user.username,
            sub: user.id,
            role: user.role,
            jti: uuidv4()
        }

        return {
            data: user,
            token: this.jwtService.sign(payload)
        }
    }

    async logout(token: string): Promise<void> {
        try {
            const decoded = this.jwtService.decode(token) as PayloadDecoded;
            if(!decoded || !decoded.jti || !decoded.exp){
                this.logger.warn('Invalid token on logout attempt', { context: this.ctx });
                return;
            }

            const { jti, exp } = decoded;
            // console.log(exp)
            // console.log(Math.floor(Date.now() / 1000))
            const ttl = exp - Math.floor(Date.now() / 1000);
            if(ttl > 0){
                const ttlInMiliSecond = ttl * 1000;
                this.logger.debug(`Adding token JTI to deny list: ${jti} with TTL: ${ttl}s`, { context: this.ctx });
                await this.keyv.set(jti, 'denied', ttlInMiliSecond);
            }
        } catch (err){
            this.logger.error('Error during token invalidation', { context: this.ctx });
        }
    }
}