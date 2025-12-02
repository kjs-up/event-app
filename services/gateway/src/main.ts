import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import rateLimit from 'express-rate-limit';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Get configuration
  const port = configService.get<number>('PORT', 3000);
  const apiPrefix = configService.get<string>('API_PREFIX', '/api/v1');
  const environment = configService.get<string>('NODE_ENV', 'development');

  // Security middleware
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", 'ws:', 'wss:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));

  // Rate limiting
  const rateLimitWindowMs = configService.get<number>('RATE_LIMIT_WINDOW_MS', 900000); // 15 minutes
  const rateLimitMaxRequests = configService.get<number>('RATE_LIMIT_MAX_REQUESTS', 100);

  app.use(rateLimit({
    windowMs: rateLimitWindowMs,
    max: rateLimitMaxRequests,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.url === '/health' || req.url === '/api/v1/health';
    },
  }));

  // Compression
  app.use(compression());

  // Global API prefix
  app.setGlobalPrefix(apiPrefix);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // CORS configuration (will be enhanced in T020)
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:5173').split(','),
    credentials: configService.get<boolean>('CORS_CREDENTIALS', true),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Swagger documentation (only in development)
  if (environment === 'development') {
    const config = new DocumentBuilder()
      .setTitle(configService.get<string>('SWAGGER_TITLE', 'Event Management Platform API'))
      .setDescription(configService.get<string>('SWAGGER_DESCRIPTION', 'Comprehensive event management platform API'))
      .setVersion(configService.get<string>('API_VERSION', '1.0.0'))
      .addBearerAuth(
        {
          description: 'JWT Authorization header using the Bearer scheme.',
          name: 'Authorization',
          bearerFormat: 'JWT',
          scheme: 'bearer',
          type: 'http',
          in: 'Header'
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(configService.get<string>('SWAGGER_PATH', '/api/docs'), app, document);

    logger.log(`Swagger documentation available at: http://localhost:${port}${configService.get<string>('SWAGGER_PATH', '/api/docs')}`);
  }

  await app.listen(port);

  logger.log(`🚀 Event Management Platform Gateway is running on: http://localhost:${port}${apiPrefix}`);
  logger.log(`🌟 Environment: ${environment}`);
}

bootstrap().catch((error) => {
  Logger.error('❌ Error starting server', error);
  process.exit(1);
});