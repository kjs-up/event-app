import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Request, Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    timestamp: string;
    path: string;
    method: string;
    statusCode: number;
    requestId?: string;
    executionTime: number;
  };
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  private readonly logger = new Logger(ResponseInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const { method, url, ip } = request;
    const userAgent = request.get('User-Agent') || '';

    // Generate request ID if not present
    const requestId = this.generateRequestId();

    // Add request ID to response headers for tracking
    response.setHeader('X-Request-ID', requestId);

    return next.handle().pipe(
      tap(() => {
        const executionTime = Date.now() - startTime;

        // Log successful requests
        this.logger.log(
          `${method} ${url} ${response.statusCode} - ${executionTime}ms - ${ip} - ${userAgent}`,
          { requestId, executionTime }
        );
      }),
      map((data) => {
        const executionTime = Date.now() - startTime;

        // Handle different response types
        if (this.isAlreadyFormatted(data)) {
          return data;
        }

        // Create standardized response
        const apiResponse: ApiResponse<T> = {
          success: response.statusCode < 400,
          data: data,
          meta: {
            timestamp: new Date().toISOString(),
            path: url,
            method: method,
            statusCode: response.statusCode,
            requestId,
            executionTime,
          },
        };

        // Add message for specific status codes
        if (response.statusCode === 201) {
          apiResponse.message = 'Resource created successfully';
        } else if (response.statusCode === 204) {
          apiResponse.message = 'Operation completed successfully';
          apiResponse.data = undefined;
        } else if (response.statusCode >= 200 && response.statusCode < 300) {
          apiResponse.message = 'Operation completed successfully';
        }

        return apiResponse;
      })
    );
  }

  private isAlreadyFormatted(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      'success' in data &&
      'meta' in data &&
      typeof data.success === 'boolean'
    );
  }

  private generateRequestId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 9);
    return `req_${timestamp}_${randomStr}`;
  }
}