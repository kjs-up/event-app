import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventProject } from '../events/entities/event-project.entity';
import { EventApproval, ApprovalAction } from '../events/entities/event-approval.entity';
import { User, UserRole } from '../users/entities/user.entity';

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface NotificationOptions {
  sendToSubmitter?: boolean;
  sendToApprovers?: boolean;
  sendToAdmins?: boolean;
  customRecipients?: string[];
}

@Injectable()
export class ApprovalNotificationService {
  private readonly logger = new Logger(ApprovalNotificationService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(EventProject)
    private readonly eventProjectRepository: Repository<EventProject>,
    @InjectRepository(EventApproval)
    private readonly approvalRepository: Repository<EventApproval>,
  ) {}

  /**
   * Send notification when event is submitted for approval
   */
  async notifyApprovalSubmitted(
    eventProject: EventProject,
    approval: EventApproval,
    options: NotificationOptions = {},
  ): Promise<void> {
    try {
      const submitter = await this.userRepository.findOne({
        where: { id: approval.submittedBy },
      });

      if (!submitter) {
        this.logger.warn(`Submitter not found for approval ${approval.id}`);
        return;
      }

      // Send confirmation to submitter
      if (options.sendToSubmitter !== false) {
        const submitterTemplate = this.generateSubmissionConfirmationTemplate(
          eventProject,
          submitter,
          approval,
        );
        await this.sendEmail(submitter.email, submitterTemplate);
      }

      // Notify approvers
      if (options.sendToApprovers !== false) {
        const approvers = await this.getApprovers();
        const approverTemplate = this.generateApprovalRequestTemplate(
          eventProject,
          submitter,
          approval,
        );

        for (const approver of approvers) {
          await this.sendEmail(approver.email, approverTemplate);
        }
      }

      // Notify admins
      if (options.sendToAdmins) {
        const admins = await this.getAdmins();
        const adminTemplate = this.generateApprovalRequestTemplate(
          eventProject,
          submitter,
          approval,
        );

        for (const admin of admins) {
          await this.sendEmail(admin.email, adminTemplate);
        }
      }

      // Custom recipients
      if (options.customRecipients?.length) {
        const customTemplate = this.generateApprovalRequestTemplate(
          eventProject,
          submitter,
          approval,
        );

        for (const email of options.customRecipients) {
          await this.sendEmail(email, customTemplate);
        }
      }

      this.logger.log(`Approval submission notifications sent for event ${eventProject.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to send approval submission notifications: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      // Don't throw - notifications shouldn't block the approval process
    }
  }

  /**
   * Send notification when event is approved
   */
  async notifyApprovalDecision(
    eventProject: EventProject,
    approval: EventApproval,
    approver: User,
    options: NotificationOptions = {},
  ): Promise<void> {
    try {
      const submitter = await this.userRepository.findOne({
        where: { id: eventProject.createdBy },
      });

      if (!submitter) {
        this.logger.warn(`Submitter not found for event ${eventProject.id}`);
        return;
      }

      let template: EmailTemplate;

      switch (approval.action) {
        case ApprovalAction.APPROVED:
          template = this.generateApprovalApprovedTemplate(
            eventProject,
            submitter,
            approver,
            approval,
          );
          break;
        case ApprovalAction.REJECTED:
          template = this.generateApprovalRejectedTemplate(
            eventProject,
            submitter,
            approver,
            approval,
          );
          break;
        case ApprovalAction.REVISION_REQUESTED:
          template = this.generateRevisionRequestedTemplate(
            eventProject,
            submitter,
            approver,
            approval,
          );
          break;
        default:
          this.logger.warn(`Unknown approval action: ${approval.action}`);
          return;
      }

      // Send notification to submitter
      if (options.sendToSubmitter !== false) {
        await this.sendEmail(submitter.email, template);
      }

      // Notify other stakeholders if needed
      if (options.sendToAdmins && approval.action === ApprovalAction.APPROVED) {
        const admins = await this.getAdmins();
        for (const admin of admins) {
          if (admin.id !== approver.id) {
            await this.sendEmail(admin.email, template);
          }
        }
      }

      this.logger.log(`Approval decision notifications sent for event ${eventProject.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to send approval decision notifications: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Send notification for upcoming approval expiration
   */
  async notifyApprovalExpiring(
    eventProject: EventProject,
    approval: EventApproval,
    hoursUntilExpiration: number,
  ): Promise<void> {
    try {
      const submitter = await this.userRepository.findOne({
        where: { id: approval.submittedBy },
      });

      const approvers = await this.getApprovers();

      const template = this.generateExpirationWarningTemplate(
        eventProject,
        submitter,
        approval,
        hoursUntilExpiration,
      );

      // Notify submitter
      if (submitter) {
        await this.sendEmail(submitter.email, template);
      }

      // Notify approvers
      for (const approver of approvers) {
        await this.sendEmail(approver.email, template);
      }

      this.logger.log(`Expiration warnings sent for approval ${approval.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to send expiration warning notifications: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Private helper methods
   */
  private async getApprovers(): Promise<User[]> {
    return await this.userRepository.find({
      where: {
        role: UserRole.APPROVER,
        isActive: true,
      },
    });
  }

  private async getAdmins(): Promise<User[]> {
    return await this.userRepository.find({
      where: {
        role: UserRole.ADMIN,
        isActive: true,
      },
    });
  }

  private async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    // This is a placeholder implementation
    // In a real application, you would integrate with an email service like SendGrid, AWS SES, etc.
    this.logger.debug(`Sending email to ${to}`, {
      subject: template.subject,
      preview: template.textContent.substring(0, 100) + '...',
    });

    // TODO: Integrate with actual email service
    // Example:
    // await this.emailService.send({
    //   to,
    //   subject: template.subject,
    //   html: template.htmlContent,
    //   text: template.textContent,
    // });
  }

  private generateSubmissionConfirmationTemplate(
    eventProject: EventProject,
    submitter: User,
    approval: EventApproval,
  ): EmailTemplate {
    const subject = `Event Submission Confirmation: ${eventProject.name}`;

    const textContent = `
Dear ${submitter.firstName},

Your event "${eventProject.name}" has been successfully submitted for approval.

Event Details:
- Event Type: ${eventProject.eventType}
- Max Capacity: ${eventProject.maxCapacity}
- Submission Date: ${approval.createdAt.toLocaleDateString()}
- Approval ID: ${approval.id}

Your event is now in the approval queue and will be reviewed by our team. You will be notified once a decision is made.

If you need to make any changes, please contact the approval team before the review is completed.

Thank you for using our Event Management Platform.

Best regards,
Event Management Team
    `.trim();

    const htmlContent = `
<h2>Event Submission Confirmation</h2>
<p>Dear ${submitter.firstName},</p>
<p>Your event "<strong>${eventProject.name}</strong>" has been successfully submitted for approval.</p>

<h3>Event Details:</h3>
<ul>
  <li><strong>Event Type:</strong> ${eventProject.eventType}</li>
  <li><strong>Max Capacity:</strong> ${eventProject.maxCapacity}</li>
  <li><strong>Submission Date:</strong> ${approval.createdAt.toLocaleDateString()}</li>
  <li><strong>Approval ID:</strong> ${approval.id}</li>
</ul>

<p>Your event is now in the approval queue and will be reviewed by our team. You will be notified once a decision is made.</p>
<p>If you need to make any changes, please contact the approval team before the review is completed.</p>

<hr>
<p>Thank you for using our Event Management Platform.</p>
<p><strong>Event Management Team</strong></p>
    `;

    return { subject, textContent, htmlContent };
  }

  private generateApprovalRequestTemplate(
    eventProject: EventProject,
    submitter: User,
    approval: EventApproval,
  ): EmailTemplate {
    const subject = `New Event Approval Request: ${eventProject.name}`;

    const textContent = `
New Event Approval Request

Event: ${eventProject.name}
Submitted by: ${submitter.firstName} ${submitter.lastName} (${submitter.email})
Event Type: ${eventProject.eventType}
Max Capacity: ${eventProject.maxCapacity}
Paid Event: ${eventProject.isPaid ? 'Yes' : 'No'}
${eventProject.isPaid ? `Price: ${eventProject.currency} ${eventProject.basePrice}` : ''}
Has Speakers: ${eventProject.hasSpeakers ? 'Yes' : 'No'}

Description:
${eventProject.description || 'No description provided'}

${approval.comments ? `Submitter Comments:\n${approval.comments}` : ''}

Approval ID: ${approval.id}
Submitted: ${approval.createdAt.toLocaleDateString()}
Expires: ${approval.expiresAt?.toLocaleDateString() || 'No expiration'}

Please review and take action on this approval request.

Event Management Platform
    `.trim();

    const htmlContent = `
<h2>New Event Approval Request</h2>

<h3>Event: ${eventProject.name}</h3>
<p><strong>Submitted by:</strong> ${submitter.firstName} ${submitter.lastName} (${submitter.email})</p>

<h4>Event Details:</h4>
<ul>
  <li><strong>Event Type:</strong> ${eventProject.eventType}</li>
  <li><strong>Max Capacity:</strong> ${eventProject.maxCapacity}</li>
  <li><strong>Paid Event:</strong> ${eventProject.isPaid ? 'Yes' : 'No'}</li>
  ${eventProject.isPaid ? `<li><strong>Price:</strong> ${eventProject.currency} ${eventProject.basePrice}</li>` : ''}
  <li><strong>Has Speakers:</strong> ${eventProject.hasSpeakers ? 'Yes' : 'No'}</li>
</ul>

<h4>Description:</h4>
<p>${eventProject.description || 'No description provided'}</p>

${approval.comments ? `<h4>Submitter Comments:</h4><p>${approval.comments}</p>` : ''}

<hr>
<p><strong>Approval ID:</strong> ${approval.id}</p>
<p><strong>Submitted:</strong> ${approval.createdAt.toLocaleDateString()}</p>
<p><strong>Expires:</strong> ${approval.expiresAt?.toLocaleDateString() || 'No expiration'}</p>

<p>Please review and take action on this approval request.</p>

<p><strong>Event Management Platform</strong></p>
    `;

    return { subject, textContent, htmlContent };
  }

  private generateApprovalApprovedTemplate(
    eventProject: EventProject,
    submitter: User,
    approver: User,
    approval: EventApproval,
  ): EmailTemplate {
    const subject = `Event Approved: ${eventProject.name}`;

    const textContent = `
Congratulations! Your event has been approved.

Event: ${eventProject.name}
Approved by: ${approver.firstName} ${approver.lastName}
Approved on: ${approval.approvedAt?.toLocaleDateString()}

${approval.comments ? `Approver Comments:\n${approval.comments}` : ''}

Your event is now ready for the next steps in the planning process.

Best regards,
Event Management Team
    `.trim();

    const htmlContent = `
<h2>🎉 Event Approved!</h2>
<p>Dear ${submitter.firstName},</p>
<p>Congratulations! Your event "<strong>${eventProject.name}</strong>" has been approved.</p>

<p><strong>Approved by:</strong> ${approver.firstName} ${approver.lastName}</p>
<p><strong>Approved on:</strong> ${approval.approvedAt?.toLocaleDateString()}</p>

${approval.comments ? `<h4>Approver Comments:</h4><p>${approval.comments}</p>` : ''}

<p>Your event is now ready for the next steps in the planning process.</p>

<hr>
<p>Best regards,<br><strong>Event Management Team</strong></p>
    `;

    return { subject, textContent, htmlContent };
  }

  private generateApprovalRejectedTemplate(
    eventProject: EventProject,
    submitter: User,
    approver: User,
    approval: EventApproval,
  ): EmailTemplate {
    const subject = `Event Rejected: ${eventProject.name}`;

    const textContent = `
Your event submission has been rejected.

Event: ${eventProject.name}
Reviewed by: ${approver.firstName} ${approver.lastName}
Reviewed on: ${approval.rejectedAt?.toLocaleDateString()}

Rejection Reason:
${approval.rejectionReason}

${approval.comments ? `Additional Comments:\n${approval.comments}` : ''}

You can revise your event and resubmit it for approval.

Best regards,
Event Management Team
    `.trim();

    const htmlContent = `
<h2>Event Submission Rejected</h2>
<p>Dear ${submitter.firstName},</p>
<p>Your event submission "<strong>${eventProject.name}</strong>" has been rejected.</p>

<p><strong>Reviewed by:</strong> ${approver.firstName} ${approver.lastName}</p>
<p><strong>Reviewed on:</strong> ${approval.rejectedAt?.toLocaleDateString()}</p>

<h4>Rejection Reason:</h4>
<p>${approval.rejectionReason}</p>

${approval.comments ? `<h4>Additional Comments:</h4><p>${approval.comments}</p>` : ''}

<p>You can revise your event and resubmit it for approval.</p>

<hr>
<p>Best regards,<br><strong>Event Management Team</strong></p>
    `;

    return { subject, textContent, htmlContent };
  }

  private generateRevisionRequestedTemplate(
    eventProject: EventProject,
    submitter: User,
    approver: User,
    approval: EventApproval,
  ): EmailTemplate {
    const subject = `Revision Requested: ${eventProject.name}`;

    const textContent = `
Revision requested for your event submission.

Event: ${eventProject.name}
Reviewed by: ${approver.firstName} ${approver.lastName}
Reviewed on: ${approval.updatedAt.toLocaleDateString()}

Revision Comments:
${approval.comments}

Please make the requested changes and resubmit your event for approval.

Best regards,
Event Management Team
    `.trim();

    const htmlContent = `
<h2>Revision Requested</h2>
<p>Dear ${submitter.firstName},</p>
<p>A revision has been requested for your event "<strong>${eventProject.name}</strong>".</p>

<p><strong>Reviewed by:</strong> ${approver.firstName} ${approver.lastName}</p>
<p><strong>Reviewed on:</strong> ${approval.updatedAt.toLocaleDateString()}</p>

<h4>Revision Comments:</h4>
<p>${approval.comments}</p>

<p>Please make the requested changes and resubmit your event for approval.</p>

<hr>
<p>Best regards,<br><strong>Event Management Team</strong></p>
    `;

    return { subject, textContent, htmlContent };
  }

  private generateExpirationWarningTemplate(
    eventProject: EventProject,
    submitter: User | null,
    approval: EventApproval,
    hoursUntilExpiration: number,
  ): EmailTemplate {
    const subject = `Approval Expiring Soon: ${eventProject.name}`;

    const textContent = `
Approval Request Expiring Soon

Event: ${eventProject.name}
${submitter ? `Submitted by: ${submitter.firstName} ${submitter.lastName}` : ''}
Time until expiration: ${hoursUntilExpiration} hours

This approval request will expire automatically if no action is taken.

Please review and take action as soon as possible.

Event Management Team
    `.trim();

    const htmlContent = `
<h2>⏰ Approval Request Expiring Soon</h2>

<h3>Event: ${eventProject.name}</h3>
${submitter ? `<p><strong>Submitted by:</strong> ${submitter.firstName} ${submitter.lastName}</p>` : ''}
<p><strong>Time until expiration:</strong> ${hoursUntilExpiration} hours</p>

<p>This approval request will expire automatically if no action is taken.</p>
<p><strong>Please review and take action as soon as possible.</strong></p>

<hr>
<p><strong>Event Management Team</strong></p>
    `;

    return { subject, textContent, htmlContent };
  }
}