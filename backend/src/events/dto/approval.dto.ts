import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitApprovalDto {
  @ApiPropertyOptional({
    description: 'Optional comments when submitting for approval',
    example: 'This event has been carefully planned and is ready for review.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Comments must not exceed 1000 characters' })
  comments?: string;
}

export class ApproveEventDto {
  @ApiPropertyOptional({
    description: 'Optional comments from the approver',
    example: 'Excellent event plan. Approved for execution.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Comments must not exceed 1000 characters' })
  comments?: string;
}

export class RejectEventDto {
  @ApiProperty({
    description: 'Reason for rejecting the event',
    example: 'The budget estimation is incomplete and needs revision.',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Rejection reason must be at least 10 characters' })
  @MaxLength(1000, { message: 'Rejection reason must not exceed 1000 characters' })
  rejectionReason: string;

  @ApiPropertyOptional({
    description: 'Additional comments from the approver',
    example: 'Please provide detailed cost breakdown and risk assessment.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Comments must not exceed 1000 characters' })
  comments?: string;
}

export class RequestRevisionDto {
  @ApiProperty({
    description: 'Comments explaining what needs to be revised',
    example: 'Please clarify the target audience and adjust the capacity accordingly.',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Revision comments must be at least 10 characters' })
  @MaxLength(1000, { message: 'Comments must not exceed 1000 characters' })
  comments: string;
}