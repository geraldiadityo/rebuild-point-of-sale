import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  const configService = app.get(ConfigService);
  const originEnv = configService.get<string>('CORS_ORIGINS');
  const allowedOrigins = originEnv ? originEnv.split(',') : [];
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept']
  });
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);
  app.enableShutdownHooks();
  await app.register(fastifyCookie, {
    secret: configService.get<string>('COOKIE_SECRET')
  })
  const port = configService.get('PORT', '8000')
  await app.listen({
    host: '0.0.0.0',
    port: port
  });
  logger.log(`Backend service running on port ${configService.get('PORT', '8080')}`, 'Bootstrap', {context: 'Bootstrap'});
}
bootstrap();
