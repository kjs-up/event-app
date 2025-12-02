import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

export interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
  details?: any;
  requestId?: string;
}

@Injectable()
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.getHttpStatus(exception);
    const message = this.getErrorMessage(exception);
    const error = this.getErrorName(exception);

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
      requestId: this.generateRequestId(),
    };

    // Add stack trace and details in development mode
    if (this.configService.get<string>('NODE_ENV') === 'development') {
      errorResponse.details = {
        stack: exception instanceof Error ? exception.stack : undefined,
        cause: exception instanceof Error ? exception.cause : undefined,
      };
    }

    // Log the error
    this.logError(exception, request, status, errorResponse.requestId);

    response.status(status).json(errorResponse);
  }

  private getHttpStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    // Handle specific error types
    if (exception instanceof Error) {
      switch (exception.name) {
        case 'ValidationError':
          return HttpStatus.BAD_REQUEST;
        case 'UnauthorizedError':
          return HttpStatus.UNAUTHORIZED;
        case 'ForbiddenError':
          return HttpStatus.FORBIDDEN;
        case 'NotFoundError':
          return HttpStatus.NOT_FOUND;
        case 'ConflictError':
          return HttpStatus.CONFLICT;
        case 'QueryFailedError':
          return HttpStatus.BAD_REQUEST;
        default:
          return HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getErrorMessage(exception: unknown): string | string[] {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'string') {
        return response;
      }

      if (typeof response === 'object' && response !== null) {
        const errorObj = response as any;
        return errorObj.message || errorObj.error || 'Internal server error';
      }
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return 'Internal server error';
  }

  private getErrorName(exception: unknown): string {
    if (exception instanceof HttpException) {
      return exception.constructor.name;
    }

    if (exception instanceof Error) {
      return exception.name;
    }

    return 'InternalServerError';
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logError(
    exception: unknown,
    request: Request,
    status: number,
    requestId: string,
  ): void {
    const message = this.getErrorMessage(exception);
    const errorName = this.getErrorName(exception);

    const logContext = {
      requestId,
      method: request.method,
      url: request.url,
      statusCode: status,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
      body: this.shouldLogBody(request) ? request.body : '[REDACTED]',
      params: request.params,
      query: request.query,
    };

    if (status >= 500) {
      this.logger.error(
        `${errorName}: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
        JSON.stringify(logContext, null, 2),
      );
    } else if (status >= 400) {
      this.logger.warn(
        `${errorName}: ${message}`,
        JSON.stringify(logContext, null, 2),
      );
    }
  }

  private shouldLogBody(request: Request): boolean {
    // Don't log sensitive endpoints
    const sensitiveEndpoints = ['/auth/login', '/auth/register', '/auth/reset-password'];
    return !sensitiveEndpoints.some(endpoint => request.url.includes(endpoint));
  }
}