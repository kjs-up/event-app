import { Module } from '@nestjs/common';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';
import { UsersModule } from '../users/users.module';
import { EventsModule } from '../events/events.module';

@Module({
    imports: [
        UsersModule,
        EventsModule,
    ],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }
