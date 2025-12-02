import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PasswordService {
  private readonly saltRounds: number;

  constructor(private readonly configService: ConfigService) {
    this.saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 12);
  }

  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Compare a plain text password with a hashed password
   */
  async comparePasswords(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Minimum length
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    // Maximum length
    if (password.length > 128) {
      errors.push('Password must be no more than 128 characters long');
    }

    // Must contain at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Must contain at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Must contain at least one number
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // Must contain at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Cannot contain whitespace
    if (/\s/.test(password)) {
      errors.push('Password cannot contain spaces');
    }

    // Check for common weak patterns
    const weakPatterns = [
      /(.)\1{3,}/, // Four or more consecutive identical characters
      /123456/, // Sequential numbers
      /abcdef/, // Sequential letters
      /qwerty/i, // Keyboard patterns
      /password/i, // Common word
      /admin/i, // Common word
    ];

    for (const pattern of weakPatterns) {
      if (pattern.test(password)) {
        errors.push('Password contains weak patterns');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate a secure random password
   */
  generateSecurePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';

    // Ensure at least one character from each required category
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specials = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specials[Math.floor(Math.random() * specials.length)];

    // Fill remaining length with random characters
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password to avoid predictable pattern
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }
}