import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

import { CustomLoggerService } from './custom-logger.service';

@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const environment = configService.get<string>('NODE_ENV', 'development');
        const logLevel = configService.get<string>('LOG_LEVEL', 'info');
        const logFormat = configService.get<string>('LOG_FORMAT', 'json');
        const logFileEnabled = configService.get<boolean>('LOG_FILE_ENABLED', true);
        const logFilePath = configService.get<string>('LOG_FILE_PATH', './logs/gateway.log');

        // Create log formats
        const formats = [];

        // Add timestamp
        formats.push(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }));

        // Add error formatting
        formats.push(winston.format.errors({ stack: true }));

        // Add context and request ID if available
        formats.push(winston.format.printf(({ timestamp, level, message, context, requestId, ...meta }) => {
          let logMessage = `${timestamp} [${level.toUpperCase()}]`;

          if (context) {
            logMessage += ` [${context}]`;
          }

          if (requestId) {
            logMessage += ` [${requestId}]`;
          }

          logMessage += ` ${message}`;

          // Add metadata if present
          if (Object.keys(meta).length > 0) {
            logMessage += ` ${JSON.stringify(meta)}`;
          }

          return logMessage;
        }));

        // Configure format based on environment
        if (logFormat === 'json' || environment === 'production') {
          formats.push(winston.format.json());
        } else {
          formats.push(winston.format.colorize({ all: true }));
        }

        // Setup transports
        const transports: winston.transport[] = [
          new winston.transports.Console({
            level: logLevel,
            format: winston.format.combine(...formats),
          }),
        ];

        // Add file transport if enabled
        if (logFileEnabled) {
          transports.push(
            new winston.transports.File({
              filename: logFilePath,
              level: logLevel,
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json(),
              ),
              maxsize: 10485760, // 10MB
              maxFiles: 5,
              tailable: true,
            }),
          );

          // Add error-only log file
          transports.push(
            new winston.transports.File({
              filename: logFilePath.replace('.log', '.error.log'),
              level: 'error',
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json(),
              ),
              maxsize: 10485760, // 10MB
              maxFiles: 5,
              tailable: true,
            }),
          );
        }

        return {
          level: logLevel,
          format: winston.format.combine(...formats),
          transports,
          defaultMeta: {
            service: 'event-gateway',
            version: configService.get<string>('API_VERSION', '1.0.0'),
            environment,
          },
          exceptionHandlers: logFileEnabled ? [
            new winston.transports.File({
              filename: logFilePath.replace('.log', '.exceptions.log'),
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json(),
              ),
            }),
          ] : [],
          rejectionHandlers: logFileEnabled ? [
            new winston.transports.File({
              filename: logFilePath.replace('.log', '.rejections.log'),
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json(),
              ),
            }),
          ] : [],
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CustomLoggerService],
  exports: [CustomLoggerService, WinstonModule],
})
export class LoggerModule {}