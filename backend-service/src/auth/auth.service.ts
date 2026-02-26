import { HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
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
import { ConfigService } from "@nestjs/config";
@Injectable()
export class AuthService {
    private readonly ctx = 'AuthService';
    constructor(
        private penggunaService: PenggunaService,
        private jwtService: JwtService,
        private configService: ConfigService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        @Inject(KEYV_INSTANCE) private keyv: Keyv
    ) {}

    async generateToken(user: PenggunaResponse): Promise<{
        accessToken: string,
        refreshToken: string
    }> {
        const payload = {
            username: user.username,
            sub: user.id,
            role: user.role,
            jti: uuidv4()
        }

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_SECRET_KEY'),
                expiresIn: '15m'
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET_KEY'),
                expiresIn: '7d'
            })
        ]);

        return { accessToken, refreshToken }
    }

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
        const tokens = await this.generateToken(user);
        const hashRt = await bcryptjs.hash(tokens.refreshToken, 10);
        const newUser = await this.penggunaService.updateRefreshToken(user.id, hashRt);

        return {
            data: newUser,
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken
        }
    }

    async regenerateToken(incomingRefreshToken: string): Promise<LoginResponse> {
        try {
            const payload = this.jwtService.verify(incomingRefreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET_KEY')
            });

            const user = await this.penggunaService.getByUsername(payload.username);
            if(!user || !user.refresh_token){
                this.logger.warn(`user with username ${payload.username}, refresh Token is null`,{context: this.ctx});
                throw new HttpException('Session was expired', HttpStatus.UNAUTHORIZED);
            }

            const isMatch = await bcryptjs.compare(incomingRefreshToken, user.refresh_token);
            if(!isMatch){
                this.logger.warn('Token is not match', HttpStatus.UNAUTHORIZED);
            }

            const userValidated = await this.penggunaService.penggunaMustExists(user.id);
            const tokens = await this.generateToken(userValidated);

            const newHash = await bcryptjs.hash(tokens.refreshToken, 10);
            const newDataUser = await this.penggunaService.updateRefreshToken(userValidated.id, newHash);

            return {
                data: newDataUser,
                token: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }
        } catch (err){
            throw new UnauthorizedException('Session Expired')
        }
    }

    async logout(token: string): Promise<void> {
        try {
            const decoded = this.jwtService.decode(token) as PayloadDecoded;
            if(!decoded || !decoded.jti || !decoded.exp){
                this.logger.warn('Invalid token on logout attempt', { context: this.ctx });
                return;
            }

            await this.penggunaService.updateRefreshToken(decoded.sub, null);

            const { jti, exp } = decoded;
            // console.log(exp)
            // console.log(Math.floor(Date.now() / 1000))
            const ttl = exp - Math.floor(Date.now() / 1000);
            if(ttl > 0){
                const ttlInMiliSecond = ttl * 1000;
                this.logger.debug(`Adding token JTI to deny list: ${jti} with TTL: ${ttl}s`, { context: this.ctx });
                await this.cache.set(jti, 'denied', ttlInMiliSecond);
            }
        } catch (err){
            this.logger.error('Error during token invalidation', { context: this.ctx });
        }
    }
}