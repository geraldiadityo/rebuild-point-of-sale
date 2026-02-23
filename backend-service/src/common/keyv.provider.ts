import KeyvRedis from "@keyv/redis";
import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import Keyv from 'keyv';
export const KEYV_INSTANCE = 'KEYV_INSTANCE';

export const keyvProvider: Provider = {
    provide: KEYV_INSTANCE,
    inject: [ConfigService, WINSTON_MODULE_PROVIDER],
    useFactory: (configService: ConfigService, logger: Logger) => {
        const password = configService.get<string>('REDIS_PASSWORD');
        const host = configService.get<string>('REDIS_HOST');
        const port = configService.get<string>('REDIS_PORT','6379');
        const ttl = configService.get<number>('CACHE_TTL');

        let redisUri: string;
        if (password) {
          // Format jika MENGGUNAKAN password (tanpa username)
          redisUri = `redis://:${password}@${host}:${port}`;
        } else {
          // Format jika TIDAK menggunakan password
          redisUri = `redis://${host}:${port}`;
        }
        const keyvRedis = new KeyvRedis(redisUri);

        keyvRedis.on('error', (err) => {
            logger.error(`Redis connection error`, {context: 'KeyProvider', error: err});
        });

        const keyv = new Keyv({ store: keyvRedis, namespace: 'cache', ttl: ttl });

        logger.info('keyv connnected to redis successfully', { context: 'KeyvProvier' });

        return keyv;
    },
};
