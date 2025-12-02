import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { User } from '../../entities/user.entity';
import { AuthService } from './auth.service';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseDto {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    emailVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class JwtAuthService {
  private readonly refreshTokenSecret: string;
  private readonly refreshTokenExpiry: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    this.refreshTokenSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    this.refreshTokenExpiry = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
  }

  /**
   * Generate access and refresh tokens for a user
   */
  async generateTokens(user: User): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(
      payload,
      {
        secret: this.refreshTokenSecret,
        expiresIn: this.refreshTokenExpiry,
      }
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Verify and decode JWT token
   */
  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return payload as JwtPayload;
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  /**
   * Verify refresh token and generate new tokens
   */
  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.refreshTokenSecret,
      });

      // Get fresh user data
      const user = await this.authService.findById(payload.sub);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Generate new token pair
      const tokens = await this.generateTokens(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authorizationHeader: string): string | null {
    if (!authorizationHeader) {
      return null;
    }

    const [type, token] = authorizationHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }

  /**
   * Revoke all tokens for a user (logout)
   * In a production system, you would typically maintain a blacklist
   * or store token versions in the database
   */
  async revokeTokens(userId: string): Promise<void> {
    // For now, we'll just ensure the user exists
    // In production, implement token blacklisting or versioning
    await this.authService.findById(userId);

    // TODO: Implement token blacklisting strategy
    // Options:
    // 1. Store token IDs in Redis with expiration
    // 2. Add token version to user entity and increment on logout
    // 3. Use JWT blacklisting service
  }

  /**
   * Get user from JWT payload
   */
  async getUserFromPayload(payload: JwtPayload): Promise<User> {
    const user = await this.authService.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.jwtService.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return true;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  }

  /**
   * Get token expiration date
   */
  getTokenExpirationDate(token: string): Date | null {
    try {
      const decoded = this.jwtService.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return null;
      }

      return new Date(decoded.exp * 1000);
    } catch {
      return null;
    }
  }

  /**
   * Create a JWT for testing purposes
   */
  async createTestToken(user: User, expiresIn?: string): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return await this.jwtService.signAsync(payload, {
      expiresIn: expiresIn || '1h',
    });
  }
}