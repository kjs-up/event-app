# Data Model: Enhanced Event Management Platform

**Date**: 2025-12-01
**Branch**: `event-platform`
**Status**: Phase 1 Design

## Overview

This document defines the core data entities, relationships, validation rules, and state transitions for the Enhanced Event Management Platform. The model supports enterprise-scale event management with advanced ticketing, multi-tenancy, compliance, and internationalization.

## Architecture Patterns

- **Database**: PostgreSQL (primary) + TimescaleDB (analytics) + Redis (caching/sessions)
- **Approach**: Domain-driven design with bounded contexts per microservice
- **Scaling**: Read replicas, partitioning by tenant/geography for global operations
- **Compliance**: Full audit trails, data encryption, GDPR/PDPA support

## Core Entities

### 1. Customer (Customer Portal Service)

**Purpose**: External organizations that request and manage events through the platform

```typescript
interface Customer {
  id: UUID;
  organizationName: string;
  contactEmail: string;
  contactPhone?: string;
  billingAddress: Address;
  taxId?: string;
  preferredLanguage: 'en' | 'th';
  subscriptionTier: 'basic' | 'premium' | 'enterprise';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  eventRequests: EventRequest[];
  billingHistory: BillingRecord[];
}
```

**Validation Rules**:
- `organizationName`: Required, 1-200 characters
- `contactEmail`: Valid email format, unique per customer
- `taxId`: Optional, format validation per jurisdiction
- `subscriptionTier`: Determines available platform modules

### 2. EventRequest (Customer Portal Service)

**Purpose**: Customer submissions for new events with approval workflow tracking

```typescript
interface EventRequest {
  id: UUID;
  customerId: UUID;
  requestedEventName: string;
  eventType: EventType;
  estimatedCapacity: number;
  preferredDates: Date[];
  selectedModules: PlatformModule[];
  customRequirements?: string;
  attachments?: FileUpload[];
  status: EventRequestStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: UUID; // Admin user ID
  reviewComments?: string;
  approvedAt?: Date;
  confirmedAt?: Date;
  launchedAt?: Date;

  // Relationships
  customer: Customer;
  approvalWorkflow: WorkflowStep[];
  generatedEvent?: Event;
}

enum EventRequestStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CONFIRMED = 'confirmed',
  LAUNCHED = 'launched'
}

enum PlatformModule {
  BASIC_REGISTRATION = 'basic_registration',
  ADVANCED_TICKETING = 'advanced_ticketing',
  SEAT_MANAGEMENT = 'seat_management',
  VIP_MANAGEMENT = 'vip_management',
  SPEAKER_MANAGEMENT = 'speaker_management',
  ANALYTICS_DASHBOARD = 'analytics_dashboard',
  MULTI_LANGUAGE = 'multi_language',
  COMPLIANCE_SUITE = 'compliance_suite'
}
```

**State Transitions**:
```
DRAFT → SUBMITTED → UNDER_REVIEW → (APPROVED/REJECTED)
APPROVED → CONFIRMED → LAUNCHED
```

**Validation Rules**:
- `estimatedCapacity`: 1-10,000 (based on subscription tier)
- `preferredDates`: Must be future dates, max 5 options
- `selectedModules`: Must be valid for customer's subscription tier

### 3. Event (Event Service)

**Purpose**: Core event entity with comprehensive metadata and configuration

```typescript
interface Event {
  id: UUID;
  customerId?: UUID; // Null for internal events
  name: string;
  description: string;
  eventType: EventType;
  status: EventStatus;

  // Scheduling
  startDate: Date;
  endDate: Date;
  timezone: string;
  isMultiDay: boolean;

  // Venue & Capacity
  venueId?: UUID;
  capacity: number;
  currentRegistrations: number;
  waitlistEnabled: boolean;
  waitlistCount: number;

  // Features
  enabledModules: PlatformModule[];
  requiresApproval: boolean;
  isPublic: boolean;

  // Metadata
  tags: string[];
  categories: string[];
  language: 'en' | 'th' | 'both';

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: UUID;

  // Relationships
  tickets: Ticket[];
  sessions: EventSession[];
  speakers: Speaker[];
  registrations: Registration[];
  venue?: Venue;
}

enum EventType {
  CONCERT = 'concert',
  CONFERENCE = 'conference',
  TRAINING = 'training',
  SEMINAR = 'seminar',
  WORKSHOP = 'workshop',
  NETWORKING = 'networking',
  MOTOR_SHOW = 'motor_show',
  TECH_TALK = 'tech_talk'
}

enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  REGISTRATION_OPEN = 'registration_open',
  REGISTRATION_CLOSED = 'registration_closed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}
```

### 4. Attendee (User Service)

**Purpose**: Individual participants with KYC data and preferences

```typescript
interface Attendee {
  id: UUID;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;

  // KYC Data
  company?: string;
  jobTitle?: string;
  dietaryRequirements?: string;
  accessibilityNeeds?: string;

  // Preferences
  preferredLanguage: 'en' | 'th';
  marketingOptIn: boolean;

  // Social Login
  socialProviders?: SocialProvider[];

  // Profile
  profilePictureUrl?: string;
  bio?: string;

  // System
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;

  // Relationships
  registrations: Registration[];
  tickets: Ticket[];
  surveys: SurveyResponse[];
}

interface SocialProvider {
  provider: 'google' | 'facebook' | 'linkedin';
  providerId: string;
  connectedAt: Date;
}
```

### 5. Ticket (Ticket Service)

**Purpose**: Digital tickets with lifecycle tracking and transfer capabilities

```typescript
interface Ticket {
  id: UUID;
  eventId: UUID;
  attendeeId: UUID;
  ticketTypeId: UUID;

  // Pricing
  basePriceAmount: number;
  basePriceCurrency: string;
  finalPriceAmount: number; // After discounts/taxes
  finalPriceCurrency: string;
  appliedPromoCode?: string;

  // Seat Assignment (if applicable)
  seatId?: UUID;
  seatNumber?: string;

  // Status & Lifecycle
  status: TicketStatus;
  issuedAt: Date;
  transferHistory: TicketTransfer[];

  // QR Code & Security
  qrCode: string; // Base64 encoded
  securityHash: string;

  // Usage
  checkedInAt?: Date;
  checkedOutAt?: Date;

  // Relationships
  event: Event;
  attendee: Attendee;
  ticketType: TicketType;
  payments: Payment[];
}

enum TicketStatus {
  RESERVED = 'reserved',
  CONFIRMED = 'confirmed',
  TRANSFERRED = 'transferred',
  USED = 'used',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

interface TicketTransfer {
  id: UUID;
  fromAttendeeId: UUID;
  toAttendeeId: UUID;
  transferredAt: Date;
  otpCode: string;
  verifiedAt?: Date;
  status: 'pending' | 'completed' | 'expired';
}
```

### 6. Payment (Payment Service)

**Purpose**: Multi-currency payment processing with compliance tracking

```typescript
interface Payment {
  id: UUID;
  eventId: UUID;
  attendeeId: UUID;
  ticketIds: UUID[];

  // Amounts
  subtotalAmount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;

  // Payment Processing
  paymentMethod: PaymentMethod;
  gatewayProvider: 'stripe' | 'omise' | 'promptpay';
  gatewayTransactionId: string;
  gatewayResponse: any; // JSON

  // Status & Timeline
  status: PaymentStatus;
  initiatedAt: Date;
  processedAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;

  // Compliance
  taxJurisdiction: string;
  taxRate: number;
  invoiceNumber: string;
  receiptUrl?: string;

  // Audit Trail
  auditLog: PaymentAuditEntry[];

  // Relationships
  event: Event;
  attendee: Attendee;
  tickets: Ticket[];
}

enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  QR_CODE = 'qr_code',
  BANK_TRANSFER = 'bank_transfer',
  WALLET = 'wallet'
}

enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}
```

### 7. Seat (Ticket Service)

**Purpose**: Individual seats with interactive mapping and reservation management

```typescript
interface Seat {
  id: UUID;
  venueId: UUID;
  eventId?: UUID; // Null for venue-level seats

  // Physical Properties
  section: string;
  row: string;
  number: string;
  seatType: SeatType;

  // Positioning
  coordinates: {
    x: number;
    y: number;
  };

  // Pricing & Availability
  basePriceAmount?: number;
  priceMultiplier: number; // For premium seats
  isAvailable: boolean;
  isReserved: boolean;
  reservedUntil?: Date;
  reservedBy?: UUID;

  // Features
  hasRestrictedView: boolean;
  accessibilityFeatures?: string[];

  // Relationships
  venue: Venue;
  currentTicket?: Ticket;
}

enum SeatType {
  STANDARD = 'standard',
  PREMIUM = 'premium',
  VIP = 'vip',
  WHEELCHAIR = 'wheelchair',
  COMPANION = 'companion'
}
```

### 8. Analytics & Survey Entities (Analytics Service)

**Purpose**: Flexible data collection for business intelligence and feedback

```typescript
// Time-series metrics (TimescaleDB)
interface EventMetric {
  time: Date;
  eventId: UUID;
  metricType: string;
  value: number;
  dimensions: Record<string, any>; // JSONB
  metadata: Record<string, any>; // JSONB
}

// Survey responses (PostgreSQL with JSON)
interface SurveyResponse {
  id: UUID;
  eventId: UUID;
  attendeeId?: UUID; // Anonymous surveys allowed
  surveyType: 'pre_event' | 'during_event' | 'post_event' | 'custom';

  // Flexible response structure
  responses: Record<string, any>; // JSONB

  // Calculated metrics
  npsScore?: number; // Net Promoter Score
  csatScore?: number; // Customer Satisfaction
  sentimentScore?: number; // AI-calculated sentiment

  // Metadata
  submittedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  language: string;

  // Relationships
  event: Event;
  attendee?: Attendee;
}

// Audit trail (Compliance Service)
interface AuditLog {
  id: UUID;
  entityType: string;
  entityId: UUID;
  action: string;
  userId?: UUID;
  changes: Record<string, any>; // JSONB - before/after values
  metadata: Record<string, any>; // JSONB
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}
```

## Database Schema Considerations

### Partitioning Strategy
```sql
-- Partition large tables by date for performance
CREATE TABLE event_metrics (LIKE event_metrics_template)
PARTITION BY RANGE (time);

-- Geographic partitioning for global compliance
CREATE TABLE audit_logs_asia (LIKE audit_logs_template);
CREATE TABLE audit_logs_europe (LIKE audit_logs_template);
```

### Indexing Strategy
```sql
-- Performance-critical indexes
CREATE INDEX idx_events_customer_date ON events(customer_id, start_date);
CREATE INDEX idx_tickets_event_status ON tickets(event_id, status);
CREATE INDEX idx_payments_gateway_status ON payments(gateway_provider, status);

-- Search and analytics indexes
CREATE INDEX idx_events_search ON events USING gin(to_tsvector('english', name || ' ' || description));
CREATE INDEX idx_survey_responses_jsonb ON survey_responses USING gin(responses);
```

### Data Retention Policies
```sql
-- Automated data lifecycle management
SELECT add_retention_policy('event_metrics', INTERVAL '7 years');
SELECT add_retention_policy('audit_logs', INTERVAL '10 years'); -- Compliance requirement
```

## Validation Rules Summary

### Business Rules
1. **Event Capacity**: Cannot exceed venue capacity or subscription limits
2. **Ticket Reservations**: 5-minute timeout for seat reservations
3. **Payment Processing**: 30-minute window for payment completion
4. **Data Retention**: 7-year minimum for financial records, GDPR-compliant deletion for personal data
5. **Multi-language**: All user-facing content must have Thai translation for Thai market events

### Technical Constraints
1. **Primary Keys**: All entities use UUID for distributed system compatibility
2. **Timestamps**: All dates in UTC with timezone information preserved
3. **Currency**: ISO 4217 currency codes, amounts stored as integers (smallest unit)
4. **Internationalization**: All text fields support Unicode, language tagging for content
5. **Audit Trail**: All entity changes must be logged with full before/after state

## State Transition Diagrams

### Event Lifecycle
```
DRAFT → PUBLISHED → REGISTRATION_OPEN → REGISTRATION_CLOSED → IN_PROGRESS → COMPLETED
                         ↓
                    CANCELLED
```

### Ticket Lifecycle
```
RESERVED → CONFIRMED → USED
    ↓          ↓
CANCELLED  TRANSFERRED → CONFIRMED → USED
    ↓          ↓
REFUNDED   CANCELLED
```

### Payment Lifecycle
```
PENDING → PROCESSING → SUCCEEDED
    ↓          ↓           ↓
CANCELLED   FAILED     REFUNDED
```

This data model supports the comprehensive requirements of the Enhanced Event Management Platform while maintaining flexibility for future enhancements and international expansion.