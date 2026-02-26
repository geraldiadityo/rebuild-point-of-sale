import { Global, Inject, MiddlewareConsumer, Module, NestModule, OnApplicationShutdown, RequestMethod } from "@nestjs/common";
import { WinstonModule } from "nest-winston";
import { loggerConfig } from "./logger.config";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { PrismaService } from "./prisma.service";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { ErrorFilter } from "src/utils/error.filter";
import { JwtModule } from "@nestjs/jwt";
import { AuthMiddleware } from "./auth.middleware";
import { KEYV_INSTANCE, keyvProvider } from "./keyv.provider";
import Keyv from "keyv";

@Global()
@Module({
    imports: [
        WinstonModule.forRoot(loggerConfig),
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ([{
                ttl: configService.get<number>('THROTTLER_TTL', 60000),
                limit: configService.get<number>('THROTTLER_LIMIT', 100),
            }]),
        }),
        ConfigModule.forRoot({
            isGlobal: true
        }),
        // CacheModule.registerAsync({
        //     isGlobal: true,
        //     imports: [ConfigModule],
        //     inject: [ConfigService],
        //     useFactory: async (configService: ConfigService) => {
        //         const password = configService.get<string>('REDIS_PASSWORD')
        //         const redisUri = `redis://default:${password}@${configService.get('REDIS_HOST', 'localhost')}:${configService.get('REDIS_PORT', 6379)}`;
        //         console.log(`Attempting connect to redis at port: ${configService.get('REDIS_PORT')}`);
        //         try {
        //             const store = new Keyv({ store: new KeyvRedis(redisUri) });

        //             store.on('error', (err) => {
        //                 console.log('Redis connection error', err)
        //             });

        //             console.log('Successfully created redis store instance for caching');
        //             return {
        //                 store: store,
        //                 ttl: configService.get('CACHE_TTL', 300),
        //             }
        //         } catch (err){
        //             console.log('Failed to connect redis', err);
        //             throw err;
        //         }
        //         // const store = new Keyv({store: new KeyvRedis(redisUri)});

        //         // return {
        //         //     store: store,
        //         //     ttl: configService.get<number>('CACHE_TTL', 300)
        //         // }
                
        //     //     try {
        //     //         const store = await redisStore({
        //     //             socket: {
        //     //                 host: configService.get<string>('REDIS_HOST', 'localhost'),
        //     //                 port: configService.get<number>('REDIS_PORT', 6379),
        //     //             },
        //     //             password: configService.get<string>('REDIS_PASSWORD'),
        //     //             ttl: configService.get<number>('CACHE_TTL', 300)
        //     //         });
        //     //         console.log('Redis store configured. Connection will be managed by redis');

        //     //         return {
        //     //             stores: store
        //     //         }
        //     //     } catch (err){
        //     //         console.error('Failed to configure Redis store during setup:', err);
        //     //         throw err;
        //     //     }
        //     }
        // }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const secret = configService.get<string>('JWT_SECRET_KEY');
                // console.log(secret);
                return {
                    secret: secret,
                    signOptions: {
                        expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}`
                    }
                }
            }
        }),
    ],
    providers: [
        PrismaService,
        keyvProvider,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard
        },
        {
            provide: APP_FILTER,
            useClass: ErrorFilter
        }
    ],
    exports: [
        PrismaService,
        JwtModule,
        keyvProvider
    ]
})
export class CommonModule implements NestModule, OnApplicationShutdown {
    constructor(
        @Inject(KEYV_INSTANCE) private readonly globalKeyv: Keyv
    ) {}
    async onApplicationShutdown(signal?: string) {
        console.log(`Recieved shutdown signal ${signal}. Closing Redis connection...`);
        try {
            if (this.globalKeyv){
                await this.globalKeyv.disconnect();
                console.log('Redis connection closed gracefully');
            }
        } catch (err){
            console.error(`Error closing redis connection`, err);
        }
    }
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware)
        .exclude(
            {
            path: '/api/auth/login',
            method: RequestMethod.POST
        },{
            path: '/api/attribute',
            method: RequestMethod.ALL
        },{
            path: '/api/attribute/*',
            method: RequestMethod.ALL
        })
        .forRoutes({
            path: '/api/*',
            method: RequestMethod.ALL
        })
    }
}