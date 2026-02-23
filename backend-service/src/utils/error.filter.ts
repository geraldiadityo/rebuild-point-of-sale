import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Inject } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { FastifyReply, FastifyRequest } from "fastify";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

@Catch(HttpException)
export class ErrorFilter implements ExceptionFilter {
    private readonly context = 'ErrorFilter';
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) {}

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();
        const request = ctx.getRequest<FastifyRequest>();
        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        const exceptionResponse = exception.getResponse();
        let errorMessage: string | object;

        if(typeof exceptionResponse === 'string'){
            errorMessage = exceptionResponse;
        } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null && 'message' in exceptionResponse){
            errorMessage = (exceptionResponse as any).message;
        } else {
            errorMessage = 'An unexpected error occured'
        }

        this.logger.warn(
            `[${request.method}] ${request.url} - Status: ${status} - Error: ${JSON.stringify(errorMessage)}`,
            {
                context: this.context,
                stack: exception.stack
            }
        );

        response.status(status).send({
            message: errorMessage,
            timestamp: new Date().toISOString(),
        })
    }
}