import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  HttpStatus,
  HttpCode,
  UnauthorizedException,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from '../services/auth.service';
import { JwtAuthService } from '../services/jwt-auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto, ChangePasswordDto, UserResponseDto } from '../dto/auth-response.dto';

import { AuthResponseDto } from '../dto/auth-response.dto';
import { error } from 'console';

import { Public } from '../decorators/public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtAuthService: JwtAuthService,
  ) { }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.authService.register(registerDto);
    const tokens = await this.jwtAuthService.generateTokens(user);

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
  }

  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.authService.findByEmail(loginDto.email.toLocaleLowerCase());
    if (!user) {
      // TO DO : log error email not found
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.jwtAuthService.generateTokens(user);

    // Update last login timestamp
    await this.authService.updateLastLogin(user.id);

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
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    try {
      const result = await this.jwtAuthService.refreshTokens(refreshTokenDto.refreshToken);
      return result;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and invalidate tokens' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Param() id: string): Promise<{ message: string }> {

    await this.jwtAuthService.revokeTokens(id);

    return { message: 'Logout successful' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req): Promise<UserResponseDto> {
    const user = req.user;
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.authService.findByEmail(changePasswordDto.email.toLocaleLowerCase());

    if (!user) {
      // TO DO : log error email not found
      throw error
    }

    await this.authService.changePassword(user.id, changePasswordDto);

    return { message: 'Password changed successfully' };
  }

  // @Post('verify-email')
  // @UseGuards(JwtAuthGuard)
  // @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Verify user email' })
  // @ApiResponse({ status: 200, description: 'Email verified successfully' })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // async verifyEmail(@Request() req): Promise<{ message: string }> {
  //   const user = req.user;
  //   await this.authService.verifyEmail(user.id);

  //   return { message: 'Email verified successfully' };
  // }
}