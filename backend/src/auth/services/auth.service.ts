import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../entities/user.entity';
import { PasswordService } from './password.service';

import { RegisterDto } from '../dto/register.dto';
import { ChangePasswordDto } from '../dto/auth-response.dto';
import { UserRole } from '../../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly passwordService: PasswordService,
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<User> {
    const { email, password, firstName, lastName, role = UserRole.MAKER } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await this.passwordService.hashPassword(password);

    // Create new user
    const user = this.userRepository.create({
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      role,
      isActive: true,
      emailVerified: false,
    });

    return await this.userRepository.save(user);
  }

  /**
   * Validate user credentials for login
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: {
        email: email.toLowerCase(),
        isActive: true,
      },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await this.passwordService.comparePasswords(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id,
        isActive: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: {
        email: email.toLowerCase(),
        isActive: true,
      },
    });
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastLogin: new Date(),
    });
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.findById(userId);

    // Verify current password
    const isCurrentPasswordValid = await this.passwordService.comparePasswords(
      currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await this.passwordService.hashPassword(newPassword);

    // Update password
    await this.userRepository.update(userId, {
      passwordHash: newPasswordHash,
    });
  }

  /**
   * Verify user email
   */
  async verifyEmail(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      emailVerified: true,
    });
  }

  /**
   * Deactivate user account (soft delete)
   */
  async deactivateUser(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      isActive: false,
      deletedAt: new Date(),
    });
  }

  /**
   * Activate user account
   */
  async activateUser(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      isActive: true,
      deletedAt: null,
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<Pick<User, 'firstName' | 'lastName'>>,
  ): Promise<User> {
    await this.userRepository.update(userId, updates);
    return await this.findById(userId);
  }

  /**
   * Check if user has specific role
   */
  async hasRole(userId: string, role: UserRole): Promise<boolean> {
    const user = await this.findById(userId);
    return user.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  async hasAnyRole(userId: string, roles: UserRole[]): Promise<boolean> {
    const user = await this.findById(userId);
    return roles.includes(user.role);
  }
}