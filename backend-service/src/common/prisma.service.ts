import { Inject, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly ctx = 'PrismaService';
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {
        super();
        this.$use(async (params, next) => {
            const start = Date.now();
            const result = await next(params);
            const duration = Date.now() - start;
            const message = `Query ${params.model}.${params.action} tooks ${duration}ms`;
            this.logger.debug(message, {
                context: PrismaService.name,
                params: params.args,
                duration: `${duration}ms`
            });

            return result;
        });
    }

    async onModuleInit() {
        await this.$connect();
        this.logger.log('info', 'Connected to ORM', { context: this.ctx });
    }

    async onModuleDestroy() {
        this.logger.log('info', 'Disconnected to ORM', { context: this.ctx });
        await this.$disconnect();
    }
}