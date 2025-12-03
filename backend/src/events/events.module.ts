import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { EventProject, FoundationTemplate, EventApproval, EventBatch } from './entities';
import { EventProjectService, ApprovalService, EventBatchService } from './services';
import { CapacityService } from './services/capacity.service';
import { EventProjectController, ApprovalController, EventBatchController } from './controllers';
import { ApprovalNotificationService } from '../notifications/approval-notification.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventProject,
      FoundationTemplate,
      EventApproval,
      EventBatch,
    ]),
    CacheModule.register(),
    UsersModule, // Import UsersModule to access User repository
  ],
  controllers: [
    EventProjectController,
    ApprovalController,
    EventBatchController,
  ],
  providers: [
    EventProjectService,
    ApprovalService,
    ApprovalNotificationService,
    EventBatchService,
    CapacityService,
  ],
  exports: [
    EventProjectService,
    ApprovalService,
    ApprovalNotificationService,
    EventBatchService,
    CapacityService,
    TypeOrmModule, // Export TypeORM module for other modules that need these entities
  ],
})
export class EventsModule { }