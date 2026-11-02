import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';

function isHttpError(
  exception: unknown,
): exception is { statusCode: number; message: string } {
  return (
    typeof exception === 'object' &&
    exception !== null &&
    'statusCode' in exception &&
    typeof exception.statusCode === 'number' &&
    Number.isInteger(exception.statusCode) &&
    exception.statusCode >= 400 &&
    exception.statusCode <= 599 &&
    'message' in exception &&
    typeof exception.message === 'string'
  );
}

@Catch()
export class HttpExceptionLoggingFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTPException');

  constructor(private readonly adapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const req = context.getRequest<Request>();
    const res = context.getResponse<Response>();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : isHttpError(exception)
          ? exception.statusCode
          : HttpStatus.INTERNAL_SERVER_ERROR;
    const responseBody =
      exception instanceof HttpException
        ? exception.getResponse()
        : {
            statusCode,
            message: isHttpError(exception)
              ? exception.message
              : 'Internal server error',
          };
    const message = {
      event: 'request_failed',
      requestId: res.getHeader('X-Request-Id'),
      method: req.method,
      path: req.path,
      statusCode,
      error: exception instanceof Error ? exception.name : 'UnknownException',
      message:
        exception instanceof Error || isHttpError(exception)
          ? exception.message
          : typeof exception === 'string'
            ? exception
            : 'Unknown exception',
      details: responseBody,
      cause:
        exception instanceof Error && exception.cause instanceof Error
          ? exception.cause.stack
          : undefined,
    };

    if (statusCode >= 500) {
      this.logger.error(
        message,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(message);
    }

    const { httpAdapter } = this.adapterHost;
    if (httpAdapter.isHeadersSent(res)) {
      httpAdapter.end(res);
      return;
    }

    httpAdapter.reply(
      res,
      typeof responseBody === 'string'
        ? { statusCode, message: responseBody }
        : responseBody,
      statusCode,
    );
  }
}
