import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventProject, FoundationTemplate, EventApproval } from './entities';
import { EventProjectService, ApprovalService } from './services';
import { EventProjectController, ApprovalController } from './controllers';
import { ApprovalNotificationService } from '../notifications/approval-notification.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventProject,
      FoundationTemplate,
      EventApproval,
    ]),
    UsersModule, // Import UsersModule to access User repository
  ],
  controllers: [
    EventProjectController,
    ApprovalController,
  ],
  providers: [
    EventProjectService,
    ApprovalService,
    ApprovalNotificationService,
  ],
  exports: [
    EventProjectService,
    ApprovalService,
    ApprovalNotificationService,
    TypeOrmModule, // Export TypeORM module for other modules that need these entities
  ],
})
export class EventsModule {}