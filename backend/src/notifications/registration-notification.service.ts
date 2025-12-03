import { Injectable, Logger } from '@nestjs/common';
import { Registration } from '../registration/entities/registration.entity';

@Injectable()
export class RegistrationNotificationService {
    private readonly logger = new Logger(RegistrationNotificationService.name);

    async sendRegistrationConfirmation(registration: Registration): Promise<void> {
        try {
            const { participant, eventBatch, referenceCode } = registration;
            const eventName = eventBatch?.eventProject?.name || 'Event';
            const batchName = eventBatch?.name || 'Session';
            const to = participant.email;

            this.logger.log(`Sending registration confirmation email to ${to} for ${eventName} - ${batchName}`);

            // In a real app, we would use an email provider here.
            // For now, we simulate it with a log.
            const subject = `Registration Confirmed: ${eventName}`;
            const content = `
                Dear ${participant.firstName},

                You have successfully registered for ${eventName} (${batchName}).
                
                Reference Code: ${referenceCode}
                
                Please keep this code for check-in.

                Best regards,
                Event Team
            `;

            this.logger.debug(`Email Content:\nSubject: ${subject}\n${content}`);

        } catch (error) {
            this.logger.error(`Failed to send registration confirmation email: ${error.message}`, error.stack);
            // We don't throw here to avoid failing the registration if email fails
        }
    }
}
