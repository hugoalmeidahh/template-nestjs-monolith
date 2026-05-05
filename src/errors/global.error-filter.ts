import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { SentryExceptionCaptured } from '@sentry/nestjs';
import { Request, Response } from 'express';
import { toSnakeCase } from 'js-convert-case';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class GlobalErrorFilter implements ExceptionFilter {
  private logger = new Logger(GlobalErrorFilter.name);

  @SentryExceptionCaptured()
  catch(error: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const id = request.headers['x-request-id'] || uuidv4();

    const internalErrorMessage = 'internal error';
    const internalErrorCode = 'internal_error';

    let message = ((typeof error.getMessage === 'function'
      ? error.getMessage()
      : undefined) ??
      error.message ??
      internalErrorMessage) as string;

    const statusCode = Number(
      typeof error.getStatus === 'function' ? error.getStatus() : 500,
    );

    const errorResponse = (
      typeof (error as HttpException).getResponse === 'function'
        ? (error as HttpException).getResponse()
        : {}
    ) as Record<string, unknown>;

    if (errorResponse?.message) {
      const respMessage = errorResponse?.message as string | string[];

      if (Array.isArray(respMessage)) {
        message = respMessage.join(', ');
      }
      if (typeof respMessage === 'string') {
        message = respMessage;
      }

      const words = /\b[a-z]+[A-Z][a-zA-Z]*\b/.exec(message);

      words?.forEach(
        (item) => (message = message.replaceAll(item, toSnakeCase(item))),
      );
    }

    message = message.trim();

    const errorName = error.name;

    let code = toSnakeCase(
      (errorName === 'Error' ? error.constructor?.name : errorName) ??
        internalErrorCode,
    ).toLowerCase();

    if (statusCode < 500) {
      this.logger.warn(message, {
        id,
        code,
        statusCode,
        error,
      });
    }

    if (statusCode >= 500) {
      this.logger.error(message, { id, code, statusCode, error });
      message = internalErrorMessage;
      code = internalErrorCode;
    }

    res.status(statusCode).json({
      id,
      code,
      message,
    });
  }
}
