import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../entities/user.entity';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'User password (min 8 characters)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'First name',
  })
  @IsString()
  @MinLength(1, { message: 'First name is required' })
  @MaxLength(100, { message: 'First name cannot exceed 100 characters' })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name',
  })
  @IsString()
  @MinLength(1, { message: 'Last name is required' })
  @MaxLength(100, { message: 'Last name cannot exceed 100 characters' })
  lastName: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.MAKER,
    description: 'User role',
    required: false,
    default: UserRole.MAKER,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  role?: UserRole = UserRole.MAKER;
}