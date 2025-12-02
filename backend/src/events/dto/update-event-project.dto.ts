import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { CreateEventProjectDto } from './create-event-project.dto';
import { EventStatus } from '../entities/event-project.entity';

export class UpdateEventProjectDto extends PartialType(CreateEventProjectDto) {
  @ApiPropertyOptional({
    description: 'Status of the event project',
    enum: EventStatus,
    example: EventStatus.PENDING_APPROVAL,
  })
  @IsOptional()
  @IsEnum(EventStatus, { message: 'Invalid event status' })
  status?: EventStatus;

  @ApiPropertyOptional({
    description: 'Rejection reason (only when rejecting)',
    example: 'The event description needs more details about the agenda.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}