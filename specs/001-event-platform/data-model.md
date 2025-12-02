# Data Model: Event Management Platform

**Feature**: Comprehensive Event Management Platform
**Date**: 2025-12-01
**Purpose**: Define data entities and relationships for implementation

## Core Entities

### User
Represents system users with role-based access control.

**Attributes**:
- `id` (UUID, Primary Key)
- `email` (String, Unique, Required)
- `password_hash` (String, Required)
- `first_name` (String, Required)
- `last_name` (String, Required)
- `role` (Enum: 'maker', 'approver', 'admin')
- `is_active` (Boolean, Default: true)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `last_login` (Timestamp, Nullable)

**Relationships**:
- One-to-many with EventProject (as creator)
- One-to-many with EventApproval (as approver)
- One-to-many with CheckInSession (as staff member)

**Validation Rules**:
- Email format validation
- Password strength requirements (min 8 chars, special chars)
- Role must be valid enum value

---

### EventProject
Represents the main event entity with multiple possible batches/editions.

**Attributes**:
- `id` (UUID, Primary Key)
- `name` (String, Required)
- `description` (Text)
- `event_type` (Enum: 'training', 'seminar', 'concert', 'entertainment', 'foundation')
- `foundation_template_id` (UUID, Nullable, Foreign Key to FoundationTemplate)
- `max_capacity` (Integer, Required, Max: 2000)
- `is_paid` (Boolean, Required)
- `base_price` (Decimal, Nullable) // Required if is_paid = true
- `currency` (String, Default: 'USD')
- `has_speakers` (Boolean, Required)
- `status` (Enum: 'draft', 'pending_approval', 'approved', 'rejected', 'archived')
- `created_by` (UUID, Foreign Key to User)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `approved_at` (Timestamp, Nullable)
- `approved_by` (UUID, Nullable, Foreign Key to User)
- `rejection_reason` (Text, Nullable)

**Relationships**:
- Many-to-one with User (creator)
- Many-to-one with User (approver)
- Many-to-one with FoundationTemplate (optional)
- One-to-many with EventBatch
- One-to-many with Speaker
- One-to-many with EventApproval

**Validation Rules**:
- Max capacity cannot exceed 2000
- Base price required when is_paid = true
- Status transitions must follow valid workflow

**State Transitions**:
```
draft → pending_approval → approved
                        → rejected → draft
approved → archived
```

---

### FoundationTemplate
Represents reusable event templates for standardization.

**Attributes**:
- `id` (UUID, Primary Key)
- `name` (String, Required)
- `description` (Text)
- `event_type` (Enum, Required)
- `default_capacity` (Integer, Required)
- `default_is_paid` (Boolean, Required)
- `default_price` (Decimal, Nullable)
- `default_has_speakers` (Boolean, Required)
- `configuration` (JSON) // Additional template settings
- `is_active` (Boolean, Default: true)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships**:
- One-to-many with EventProject

---

### EventBatch
Represents specific instances/editions of an event project with actual dates and capacity.

**Attributes**:
- `id` (UUID, Primary Key)
- `event_project_id` (UUID, Foreign Key to EventProject)
- `batch_number` (Integer, Required)
- `name` (String) // e.g., "Spring 2024 Edition"
- `start_date` (Date, Required)
- `end_date` (Date, Required)
- `start_time` (Time, Required)
- `end_time` (Time, Required)
- `location` (String, Required)
- `location_details` (Text)
- `capacity` (Integer, Required) // Can be <= project max_capacity
- `current_registrations` (Integer, Default: 0)
- `registration_open_date` (Timestamp, Required)
- `registration_close_date` (Timestamp, Required)
- `status` (Enum: 'upcoming', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled')
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships**:
- Many-to-one with EventProject
- One-to-many with Registration
- One-to-many with CheckInSession

**Validation Rules**:
- End date/time must be after start date/time
- Registration close must be before start date
- Capacity cannot exceed project max_capacity
- Current registrations cannot exceed capacity

---

### Speaker
Represents speakers associated with events.

**Attributes**:
- `id` (UUID, Primary Key)
- `event_project_id` (UUID, Foreign Key to EventProject)
- `first_name` (String, Required)
- `last_name` (String, Required)
- `bio` (Text)
- `title` (String)
- `company` (String)
- `email` (String)
- `phone` (String)
- `profile_image_url` (String, Nullable)
- `linkedin_url` (String, Nullable)
- `display_order` (Integer, Default: 0)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships**:
- Many-to-one with EventProject

---

### Participant
Represents individuals who register for events.

**Attributes**:
- `id` (UUID, Primary Key)
- `email` (String, Required)
- `first_name` (String, Required)
- `last_name` (String, Required)
- `phone` (String)
- `company` (String)
- `title` (String)
- `dietary_restrictions` (String)
- `special_requirements` (Text)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships**:
- One-to-many with Registration

**Validation Rules**:
- Email format validation
- Phone format validation

---

### Registration
Links participants to specific event batches with payment and status information.

**Attributes**:
- `id` (UUID, Primary Key)
- `event_batch_id` (UUID, Foreign Key to EventBatch)
- `participant_id` (UUID, Foreign Key to Participant)
- `registration_type` (Enum: 'online', 'walk_in')
- `status` (Enum: 'pending', 'confirmed', 'waitlisted', 'cancelled')
- `payment_status` (Enum: 'not_required', 'pending', 'paid', 'failed', 'refunded')
- `payment_amount` (Decimal, Nullable)
- `registration_date` (Timestamp)
- `confirmation_sent` (Boolean, Default: false)
- `checked_in` (Boolean, Default: false)
- `check_in_time` (Timestamp, Nullable)
- `notes` (Text)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships**:
- Many-to-one with EventBatch
- Many-to-one with Participant
- One-to-many with Payment

**Validation Rules**:
- Unique constraint on (event_batch_id, participant_id)
- Payment amount required when payment_status != 'not_required'

---

### Payment
Represents financial transactions for event registrations.

**Attributes**:
- `id` (UUID, Primary Key)
- `registration_id` (UUID, Foreign Key to Registration)
- `payment_provider` (Enum: 'stripe', 'paypal', 'promptpay', 'nets_qr')
- `provider_transaction_id` (String, Unique)
- `payment_method` (Enum: 'credit_card', 'qr_code', 'bank_transfer')
- `amount` (Decimal, Required)
- `currency` (String, Required)
- `status` (Enum: 'pending', 'completed', 'failed', 'cancelled', 'refunded')
- `payment_date` (Timestamp, Nullable)
- `failure_reason` (String, Nullable)
- `receipt_url` (String, Nullable)
- `refund_amount` (Decimal, Nullable)
- `refund_date` (Timestamp, Nullable)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships**:
- Many-to-one with Registration

**Validation Rules**:
- Amount must be positive
- Provider transaction ID required for completed payments

---

### CheckInSession
Represents staff check-in sessions at events.

**Attributes**:
- `id` (UUID, Primary Key)
- `event_batch_id` (UUID, Foreign Key to EventBatch)
- `staff_user_id` (UUID, Foreign Key to User)
- `session_start` (Timestamp, Required)
- `session_end` (Timestamp, Nullable)
- `check_ins_processed` (Integer, Default: 0)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships**:
- Many-to-one with EventBatch
- Many-to-one with User

---

### EventReport
Represents generated reports for post-event analysis.

**Attributes**:
- `id` (UUID, Primary Key)
- `event_batch_id` (UUID, Foreign Key to EventBatch)
- `report_type` (Enum: 'attendance', 'financial', 'summary', 'analytics')
- `generated_by` (UUID, Foreign Key to User)
- `file_format` (Enum: 'pdf', 'excel')
- `file_url` (String)
- `file_size` (Integer)
- `generation_status` (Enum: 'pending', 'completed', 'failed')
- `parameters` (JSON) // Report generation parameters
- `generated_at` (Timestamp, Nullable)
- `expires_at` (Timestamp) // File cleanup date
- `download_count` (Integer, Default: 0)
- `created_at` (Timestamp)

**Relationships**:
- Many-to-one with EventBatch
- Many-to-one with User

---

## Entity Relationship Diagram

```
User
├── creates → EventProject
├── approves → EventProject
└── manages → CheckInSession

FoundationTemplate
└── templates → EventProject

EventProject
├── has → EventBatch (1:many)
├── has → Speaker (1:many)
└── has → EventApproval (1:many)

EventBatch
├── has → Registration (1:many)
├── has → CheckInSession (1:many)
└── has → EventReport (1:many)

Participant
└── has → Registration (1:many)

Registration
└── has → Payment (1:many)
```

## Data Retention Policies

Based on research findings:

- **Financial Data (Payments)**: 7 years
- **Participant Data**: 3 years from last event participation
- **Event Analytics**: 1 year rolling
- **Reports**: 90 days for generated files, metadata retained longer
- **User Sessions**: 30 days inactive cleanup

## Performance Considerations

**Indexing Strategy**:
- Primary keys (UUID) with btree indexes
- Event queries: (status, created_at), (event_type, status)
- Registration queries: (event_batch_id, status), (participant_id, registration_date)
- Payment queries: (status, payment_date), (provider_transaction_id)
- User queries: (email), (role, is_active)

**Partitioning**:
- Registration and Payment tables partitioned by year
- EventReport table partitioned by generation date

**Caching**:
- Event details (Redis, 1-hour TTL)
- Current registration counts (Redis, real-time updates)
- User session data (Redis, configurable TTL)
- Report generation status (Redis, until completion)

## Data Validation Summary

All entities include standard validation rules for data integrity, with specific business rules for:
- Event capacity limits (max 2,000)
- Payment amount consistency
- Date/time logical constraints
- Status transition validation
- Email and phone format validation
- Foreign key constraint enforcement