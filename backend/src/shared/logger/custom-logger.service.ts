import { Injectable, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';
import { Logger } from 'winston';

@Injectable()
export class CustomLoggerService implements LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  log(message: any, context?: string, requestId?: string): void {
    this.logger.info(message, { context, requestId });
  }

  error(message: any, trace?: string, context?: string, requestId?: string): void {
    this.logger.error(message, { context, requestId, trace });
  }

  warn(message: any, context?: string, requestId?: string): void {
    this.logger.warn(message, { context, requestId });
  }

  debug(message: any, context?: string, requestId?: string): void {
    this.logger.debug(message, { context, requestId });
  }

  verbose(message: any, context?: string, requestId?: string): void {
    this.logger.verbose(message, { context, requestId });
  }

  // Custom methods for structured logging
  logRequest(method: string, url: string, statusCode: number, responseTime: number, requestId?: string): void {
    this.logger.info('HTTP Request', {
      context: 'HttpRequest',
      method,
      url,
      statusCode,
      responseTime: `${responseTime}ms`,
      requestId,
    });
  }

  logError(error: Error, context?: string, requestId?: string): void {
    this.logger.error(error.message, {
      context,
      requestId,
      error: error.name,
      stack: error.stack,
    });
  }

  logUserAction(userId: string, action: string, details?: any, requestId?: string): void {
    this.logger.info('User Action', {
      context: 'UserAction',
      userId,
      action,
      details,
      requestId,
    });
  }

  logDatabaseQuery(query: string, executionTime: number, requestId?: string): void {
    this.logger.debug('Database Query', {
      context: 'Database',
      query: query.substring(0, 200), // Truncate long queries
      executionTime: `${executionTime}ms`,
      requestId,
    });
  }

  logPaymentEvent(eventType: string, paymentId: string, amount: number, currency: string, requestId?: string): void {
    this.logger.info('Payment Event', {
      context: 'Payment',
      eventType,
      paymentId,
      amount,
      currency,
      requestId,
    });
  }

  logSecurityEvent(eventType: string, userId?: string, ipAddress?: string, userAgent?: string, requestId?: string): void {
    this.logger.warn('Security Event', {
      context: 'Security',
      eventType,
      userId,
      ipAddress,
      userAgent,
      requestId,
    });
  }

  logPerformanceMetric(operationName: string, duration: number, metadata?: any, requestId?: string): void {
    this.logger.info('Performance Metric', {
      context: 'Performance',
      operationName,
      duration: `${duration}ms`,
      metadata,
      requestId,
    });
  }
}