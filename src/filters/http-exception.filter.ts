import type { TypedResponse } from 'express';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<TypedResponse>();
    const status = exception.getStatus();
    const ex = exception as any;

    if (!res.headersSent) {
      res.status(status).json({
        code: status,
        error: Array.isArray(ex.response?.message)
          ? ex.response?.message?.filter(Boolean)
          : ex.message,
      });
    }
  }
}
