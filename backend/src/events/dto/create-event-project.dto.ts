import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUUID,
  Min,
  Max,
  MinLength,
  MaxLength,
  ValidateIf,
  IsPositive,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EventType } from '../enums/event.enums';

export class CreateEventProjectDto {
  @ApiProperty({
    description: 'Name of the event',
    example: 'Annual Developer Conference',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Event name must be at least 3 characters long' })
  @MaxLength(255, { message: 'Event name must not exceed 255 characters' })
  name: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the event',
    example: 'A comprehensive conference covering the latest in web development...',
    maxLength: 5000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(5000, { message: 'Description must not exceed 5000 characters' })
  description?: string;

  @ApiProperty({
    description: 'Type of event',
    enum: EventType,
    example: EventType.SEMINAR,
  })
  @IsEnum(EventType, { message: 'Invalid event type' })
  eventType: EventType;

  @ApiPropertyOptional({
    description: 'Foundation template ID to use as a base',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Foundation template ID must be a valid UUID' })
  foundationTemplateId?: string;

  @ApiProperty({
    description: 'Maximum number of participants (1-2000)',
    example: 150,
    minimum: 1,
    maximum: 2000,
  })
  @IsNumber({}, { message: 'Max capacity must be a number' })
  @Type(() => Number)
  @Min(1, { message: 'Max capacity must be at least 1' })
  @Max(2000, { message: 'Max capacity cannot exceed 2000' })
  maxCapacity: number;

  @ApiProperty({
    description: 'Whether the event requires payment',
    example: true,
  })
  @IsBoolean({ message: 'isPaid must be a boolean value' })
  @Type(() => Boolean)
  isPaid: boolean;

  @ApiPropertyOptional({
    description: 'Base price for the event (required if isPaid is true)',
    example: 99.99,
    minimum: 0.01,
  })
  @ValidateIf((obj) => obj.isPaid === true)
  @IsNumber({}, { message: 'Base price must be a number' })
  @Type(() => Number)
  @IsPositive({ message: 'Base price must be positive' })
  basePrice?: number;

  @ApiPropertyOptional({
    description: 'Currency code for pricing',
    example: 'USD',
    default: 'USD',
    pattern: '^[A-Z]{3}$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/, { message: 'Currency must be a 3-letter uppercase code' })
  currency?: string = 'USD';

  @ApiProperty({
    description: 'Whether the event includes speakers',
    example: true,
  })
  @IsBoolean({ message: 'hasSpeakers must be a boolean value' })
  @Type(() => Boolean)
  hasSpeakers: boolean;
}