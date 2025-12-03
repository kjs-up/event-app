import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Registration } from './entities/registration.entity';
import { Participant } from './entities/participant.entity';
import { RegistrationService } from './services/registration.service';
import { ParticipantService } from './services/participant.service';
import { WaitlistService } from './services/waitlist.service';
import { RegistrationController } from './controllers/registration.controller';
import { EventsModule } from '../events/events.module';
import { CapacityGateway } from '../gateway/capacity.gateway';
import { RegistrationNotificationService } from '../notifications/registration-notification.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Registration, Participant]),
        EventsModule,
    ],
    controllers: [RegistrationController],
    providers: [
        RegistrationService,
        ParticipantService,
        WaitlistService,
        CapacityGateway,
        RegistrationNotificationService,
    ],
    exports: [RegistrationService, ParticipantService, WaitlistService],
})
export class RegistrationModule { }
