import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { REQUEST_ID_HEADER } from '../constants/request.constants';

type RequestWithId = Request & {
  requestId?: string;
};

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<RequestWithId>();
    const res = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Log unhandled (non-HTTP) exceptions với full stack trace để dễ debug
    if (!isHttpException) {
      const err = exception instanceof Error ? exception : new Error(String(exception));
      this.logger.error(
        `[500] Unhandled exception on ${req.method} ${req.originalUrl}: ${err.message}`,
        err.stack,
      );
    }

    const exceptionResponse = isHttpException ? exception.getResponse() : null;

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as { message?: string | string[] } | null)?.message ??
          'Internal server error';

    res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      requestId: req.requestId ?? req.header(REQUEST_ID_HEADER),
    });
  }
}
