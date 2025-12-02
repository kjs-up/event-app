import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtAuthService } from './services/jwt-auth.service';
import { PasswordService } from './services/password.service';

import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RolesGuard } from './guards/roles.guard';

import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    // TypeORM for User entity
    TypeOrmModule.forFeature([User]),

    // Passport configuration
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),

    // JWT configuration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h') as any,
          issuer: 'event-platform-api',
          audience: 'event-platform-clients',
        },
      }),
      inject: [ConfigService],
    }),

    ConfigModule,
  ],

  controllers: [AuthController],

  providers: [
    // Services
    AuthService,
    JwtAuthService,
    PasswordService,

    // Strategies
    JwtStrategy,
    LocalStrategy,

    // Guards
    JwtAuthGuard,
    LocalAuthGuard,
    RolesGuard,
  ],

  exports: [
    // Export services for use in other modules
    AuthService,
    JwtAuthService,
    PasswordService,

    // Export guards for use in other modules
    JwtAuthGuard,
    LocalAuthGuard,
    RolesGuard,

    // Export JWT module for token operations
    JwtModule,
  ],
})
export class AuthModule { }