# Tasks: Comprehensive Event Management Platform

**Input**: Design documents from `/specs/001-event-platform/`
**Prerequisites**: plan.md (✓), spec.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓)

**Tests**: Tests are NOT explicitly requested in the specification, focusing on implementation tasks only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/` (per plan.md structure)
- All paths relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create backend project structure with NestJS framework in backend/
- [ ] T002 Create frontend project structure with React TypeScript in frontend/
- [ ] T003 [P] Setup backend package.json with NestJS, TypeScript, PostgreSQL, Redis dependencies
- [ ] T004 [P] Setup frontend package.json with React 18+, TypeScript, Material-UI dependencies
- [ ] T005 [P] Configure TypeScript config files for backend/tsconfig.json and frontend/tsconfig.json
- [ ] T006 [P] Setup ESLint and Prettier configuration in backend/.eslintrc.js and frontend/.eslintrc.js
- [ ] T007 [P] Create shared TypeScript types in shared/types/index.ts
- [ ] T008 [P] Setup Docker Compose for PostgreSQL and Redis in docker-compose.dev.yml
- [X] T009 Create environment configuration files backend/.env.example and frontend/.env.example

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T010 Setup database connection and TypeORM configuration in backend/src/database/database.module.ts
- [X] T011 [P] Create database migration framework setup in backend/migrations/
- [X] T012 [P] Implement JWT authentication module structure in backend/src/auth/auth.module.ts
- [ ] T013 [P] Setup API routing and middleware structure in backend/src/app.module.ts
- [ ] T014 [P] Create User entity and migration in backend/src/users/entities/user.entity.ts
- [ ] T015 [P] Setup role-based authorization guards in backend/src/auth/guards/roles.guard.ts
- [ ] T016 [P] Configure error handling middleware in backend/src/shared/filters/http-exception.filter.ts
- [ ] T017 [P] Setup logging infrastructure with Winston in backend/src/shared/logger/logger.module.ts
- [ ] T018 [P] Setup Redis connection for caching and sessions in backend/src/cache/cache.module.ts
- [ ] T019 [P] Create API response interceptor in backend/src/shared/interceptors/response.interceptor.ts
- [ ] T020 [P] Setup CORS and security middleware in backend/src/main.ts
- [ ] T021 [P] Setup React routing structure in frontend/src/App.tsx
- [ ] T022 [P] Create authentication context and hooks in frontend/src/contexts/AuthContext.tsx
- [ ] T023 [P] Setup API client with interceptors in frontend/src/services/api.ts
- [ ] T024 [P] Create base layout components in frontend/src/components/layout/Layout.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Event Creation and Approval Workflow (Priority: P1) 🎯 MVP

**Goal**: Makers can create events, submit for approval; Approvers can review and approve/reject events

**Independent Test**: Create test event project, submit for approval, verify approval workflow delivers fully approved event ready for configuration

### Implementation for User Story 1

- [ ] T025 [P] [US1] Create EventProject entity in backend/src/events/entities/event-project.entity.ts
- [ ] T026 [P] [US1] Create FoundationTemplate entity in backend/src/events/entities/foundation-template.entity.ts
- [ ] T027 [P] [US1] Create EventApproval entity in backend/src/events/entities/event-approval.entity.ts
- [ ] T028 [US1] Create EventProjectService with CRUD operations in backend/src/events/services/event-project.service.ts
- [ ] T029 [US1] Create ApprovalService with approval workflow logic in backend/src/events/services/approval.service.ts
- [ ] T030 [US1] Implement EventProjectController with endpoints in backend/src/events/controllers/event-project.controller.ts
- [ ] T031 [US1] Implement ApprovalController with approve/reject endpoints in backend/src/events/controllers/approval.controller.ts
- [ ] T032 [US1] Add validation DTOs for event creation in backend/src/events/dto/create-event-project.dto.ts
- [ ] T033 [US1] Add email notification service for approvals in backend/src/notifications/approval-notification.service.ts
- [ ] T034 [P] [US1] Create EventList page component in frontend/src/pages/events/EventList.tsx
- [ ] T035 [P] [US1] Create EventCreate form component in frontend/src/pages/events/EventCreate.tsx
- [ ] T036 [P] [US1] Create ApprovalQueue page component in frontend/src/pages/events/ApprovalQueue.tsx
- [ ] T037 [P] [US1] Create EventCard component in frontend/src/components/events/EventCard.tsx
- [ ] T038 [P] [US1] Create ApprovalActions component in frontend/src/components/events/ApprovalActions.tsx
- [ ] T039 [US1] Create events API service client in frontend/src/services/events.service.ts
- [ ] T040 [US1] Implement role-based route protection for Maker/Approver views in frontend/src/hooks/useRole.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Event Registration Management (Priority: P2)

**Goal**: Participants can register for events online; Staff can manage registrations and process walk-ins; Real-time capacity tracking

**Independent Test**: Create approved event, enable registration, test online and walk-in registration, verify capacity management works correctly

### Implementation for User Story 2

- [ ] T041 [P] [US2] Create EventBatch entity in backend/src/events/entities/event-batch.entity.ts
- [ ] T042 [P] [US2] Create Participant entity in backend/src/registration/entities/participant.entity.ts
- [ ] T043 [P] [US2] Create Registration entity in backend/src/registration/entities/registration.entity.ts
- [ ] T044 [US2] Create EventBatchService with batch management in backend/src/events/services/event-batch.service.ts
- [ ] T045 [US2] Create RegistrationService with registration logic in backend/src/registration/services/registration.service.ts
- [ ] T046 [US2] Create ParticipantService with participant management in backend/src/registration/services/participant.service.ts
- [ ] T047 [US2] Implement RegistrationController with public endpoints in backend/src/registration/controllers/registration.controller.ts
- [ ] T048 [US2] Implement capacity tracking with Redis cache in backend/src/events/services/capacity.service.ts
- [ ] T049 [US2] Setup WebSocket gateway for real-time capacity updates in backend/src/gateway/capacity.gateway.ts
- [ ] T050 [US2] Add registration confirmation email service in backend/src/notifications/registration-notification.service.ts
- [ ] T051 [US2] Create waitlist management service in backend/src/registration/services/waitlist.service.ts
- [ ] T052 [P] [US2] Create EventRegistration page component in frontend/src/pages/registration/EventRegistration.tsx
- [ ] T053 [P] [US2] Create RegistrationForm component in frontend/src/components/registration/RegistrationForm.tsx
- [ ] T054 [P] [US2] Create CapacityTracker component in frontend/src/components/events/CapacityTracker.tsx
- [ ] T055 [P] [US2] Create WalkInRegistration staff interface in frontend/src/pages/registration/WalkInRegistration.tsx
- [ ] T056 [P] [US2] Create RegistrationList management component in frontend/src/components/registration/RegistrationList.tsx
- [ ] T057 [US2] Create registration API service client in frontend/src/services/registration.service.ts
- [ ] T058 [US2] Implement WebSocket hook for real-time capacity in frontend/src/hooks/useRealTimeCapacity.ts
- [ ] T059 [US2] Add event batch management to EventDetail page in frontend/src/pages/events/EventDetail.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Payment Processing for Paid Events (Priority: P3)

**Goal**: Process payments via QR code and credit card; Issue receipts; Track payment status integrated with registration

**Independent Test**: Create paid event, process test payments through both methods, verify payment confirmation integrates with registration

### Implementation for User Story 3

- [ ] T060 [P] [US3] Create Payment entity in backend/src/payments/entities/payment.entity.ts
- [ ] T061 [P] [US3] Setup Stripe payment provider integration in backend/src/payments/providers/stripe.provider.ts
- [ ] T062 [P] [US3] Setup QR payment provider interface in backend/src/payments/providers/qr-payment.provider.ts
- [ ] T063 [US3] Create PaymentService with payment processing logic in backend/src/payments/services/payment.service.ts
- [ ] T064 [US3] Create PaymentProviderFactory for multi-gateway support in backend/src/payments/services/payment-provider.factory.ts
- [ ] T065 [US3] Implement PaymentController with payment intents in backend/src/payments/controllers/payment.controller.ts
- [ ] T066 [US3] Setup payment webhooks handler in backend/src/payments/controllers/webhook.controller.ts
- [ ] T067 [US3] Add payment validation and retry logic in backend/src/payments/services/payment-validator.service.ts
- [ ] T068 [US3] Integrate payment status with registration workflow in backend/src/registration/services/registration.service.ts (update)
- [ ] T069 [US3] Add receipt generation and email service in backend/src/notifications/receipt-notification.service.ts
- [ ] T070 [P] [US3] Create PaymentForm component in frontend/src/components/payments/PaymentForm.tsx
- [ ] T071 [P] [US3] Create CreditCardPayment component in frontend/src/components/payments/CreditCardPayment.tsx
- [ ] T072 [P] [US3] Create QRCodePayment component in frontend/src/components/payments/QRCodePayment.tsx
- [ ] T073 [P] [US3] Create PaymentStatus component in frontend/src/components/payments/PaymentStatus.tsx
- [ ] T074 [US3] Create payment API service client in frontend/src/services/payment.service.ts
- [ ] T075 [US3] Integrate payment flow with registration process in frontend/src/pages/registration/EventRegistration.tsx (update)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Event Check-in System (Priority: P4)

**Goal**: Staff check-in interface; Participant verification; Real-time attendance tracking

**Independent Test**: Create event with registered participants, staff log in and check in participants, verify attendance tracking works

### Implementation for User Story 4

- [ ] T076 [P] [US4] Create CheckInSession entity in backend/src/check-in/entities/check-in-session.entity.ts
- [ ] T077 [US4] Create CheckInService with session management in backend/src/check-in/services/check-in.service.ts
- [ ] T078 [US4] Create AttendanceService for tracking logic in backend/src/check-in/services/attendance.service.ts
- [ ] T079 [US4] Implement CheckInController with staff endpoints in backend/src/check-in/controllers/check-in.controller.ts
- [ ] T080 [US4] Add participant search and verification logic in backend/src/check-in/services/participant-lookup.service.ts
- [ ] T081 [US4] Setup WebSocket gateway for real-time check-in updates in backend/src/gateway/check-in.gateway.ts
- [ ] T082 [US4] Update Registration entity with check-in timestamp in backend/src/registration/entities/registration.entity.ts (migration)
- [ ] T083 [P] [US4] Create CheckInDashboard page component in frontend/src/pages/check-in/CheckInDashboard.tsx
- [ ] T084 [P] [US4] Create ParticipantSearch component in frontend/src/components/check-in/ParticipantSearch.tsx
- [ ] T085 [P] [US4] Create CheckInActions component in frontend/src/components/check-in/CheckInActions.tsx
- [ ] T086 [P] [US4] Create AttendanceCounter component in frontend/src/components/check-in/AttendanceCounter.tsx
- [ ] T087 [US4] Create check-in API service client in frontend/src/services/check-in.service.ts
- [ ] T088 [US4] Implement WebSocket hook for real-time attendance in frontend/src/hooks/useRealTimeAttendance.ts

**Checkpoint**: At this point, User Stories 1-4 should all work independently

---

## Phase 7: User Story 5 - Speaker and Event Content Management (Priority: P5)

**Goal**: Configure events with speakers; Manage speaker details; Support multiple event batches/editions

**Independent Test**: Create events with and without speakers, add speaker details, create multiple editions

### Implementation for User Story 5

- [ ] T089 [P] [US5] Create Speaker entity in backend/src/speakers/entities/speaker.entity.ts
- [ ] T090 [US5] Create SpeakerService with CRUD operations in backend/src/speakers/services/speaker.service.ts
- [ ] T091 [US5] Implement SpeakerController with management endpoints in backend/src/speakers/controllers/speaker.controller.ts
- [ ] T092 [US5] Add speaker validation DTOs in backend/src/speakers/dto/create-speaker.dto.ts
- [ ] T093 [US5] Update EventProjectService to handle speaker associations in backend/src/events/services/event-project.service.ts (update)
- [ ] T094 [US5] Add file upload service for speaker profile images in backend/src/shared/services/file-upload.service.ts
- [ ] T095 [P] [US5] Create SpeakerList component in frontend/src/components/speakers/SpeakerList.tsx
- [ ] T096 [P] [US5] Create SpeakerForm component in frontend/src/components/speakers/SpeakerForm.tsx
- [ ] T097 [P] [US5] Create SpeakerProfile component in frontend/src/components/speakers/SpeakerProfile.tsx
- [ ] T098 [P] [US5] Create EventBatchManager component in frontend/src/components/events/EventBatchManager.tsx
- [ ] T099 [US5] Create speaker API service client in frontend/src/services/speakers.service.ts
- [ ] T100 [US5] Update EventCreate form to include speaker configuration in frontend/src/pages/events/EventCreate.tsx (update)
- [ ] T101 [US5] Update EventDetail page to display speakers in frontend/src/pages/events/EventDetail.tsx (update)

**Checkpoint**: At this point, User Stories 1-5 should all work independently

---

## Phase 8: User Story 6 - Post-Event Reporting and Analytics (Priority: P6)

**Goal**: Generate comprehensive reports; Dashboard analytics; PDF/Excel export functionality

**Independent Test**: Complete full event lifecycle, generate reports with real data, verify dashboard analytics

### Implementation for User Story 6

- [ ] T102 [P] [US6] Create EventReport entity in backend/src/reports/entities/event-report.entity.ts
- [ ] T103 [US6] Create ReportGenerationService in backend/src/reports/services/report-generation.service.ts
- [ ] T104 [US6] Create AnalyticsService for metrics calculation in backend/src/reports/services/analytics.service.ts
- [ ] T105 [P] [US6] Setup PDF generation service with Puppeteer in backend/src/reports/services/pdf-generator.service.ts
- [ ] T106 [P] [US6] Setup Excel generation service with ExcelJS in backend/src/reports/services/excel-generator.service.ts
- [ ] T107 [US6] Implement ReportsController with generation endpoints in backend/src/reports/controllers/reports.controller.ts
- [ ] T108 [US6] Add file storage service for report files in backend/src/shared/services/file-storage.service.ts
- [ ] T109 [US6] Create report templates and layouts in backend/src/reports/templates/
- [ ] T110 [P] [US6] Create Dashboard page component in frontend/src/pages/dashboard/Dashboard.tsx
- [ ] T111 [P] [US6] Create AnalyticsCharts component in frontend/src/components/reports/AnalyticsCharts.tsx
- [ ] T112 [P] [US6] Create ReportGeneration component in frontend/src/components/reports/ReportGeneration.tsx
- [ ] T113 [P] [US6] Create EventMetrics component in frontend/src/components/reports/EventMetrics.tsx
- [ ] T114 [US6] Create reports API service client in frontend/src/services/reports.service.ts
- [ ] T115 [US6] Create analytics hooks for data fetching in frontend/src/hooks/useAnalytics.ts

**Checkpoint**: All user stories should now be independently functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T116 [P] Add comprehensive error boundaries in frontend/src/components/error/ErrorBoundary.tsx
- [ ] T117 [P] Implement global loading states in frontend/src/components/common/LoadingSpinner.tsx
- [ ] T118 [P] Add form validation library integration in frontend/src/utils/validation.ts
- [ ] T119 [P] Setup end-to-end testing configuration in e2e/
- [ ] T120 [P] Add API documentation generation in backend/src/docs/
- [ ] T121 [P] Implement database seeding for development in backend/src/database/seeds/
- [ ] T122 [P] Add performance monitoring middleware in backend/src/shared/middleware/performance.middleware.ts
- [ ] T123 [P] Setup application health checks in backend/src/health/health.controller.ts
- [ ] T124 Code cleanup and refactoring across all modules
- [ ] T125 Security hardening and vulnerability assessment
- [ ] T126 Run quickstart.md validation and update documentation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5 → P6)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent but may reference approved events from US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Integrates with registration from US2 but independently testable
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Requires registered participants from US2 for testing
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - Enhances events from US1 but independently testable
- **User Story 6 (P6)**: Can start after Foundational (Phase 2) - Requires completed events for meaningful reports

### Within Each User Story

- Entity models before services
- Services before controllers/components
- Backend endpoints before frontend integration
- Core implementation before WebSocket/real-time features
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Models within a story marked [P] can run in parallel
- Frontend components within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all entities for User Story 1 together:
Task: "Create EventProject entity in backend/src/events/entities/event-project.entity.ts"
Task: "Create FoundationTemplate entity in backend/src/events/entities/foundation-template.entity.ts"
Task: "Create EventApproval entity in backend/src/events/entities/event-approval.entity.ts"

# Launch all frontend components for User Story 1 together:
Task: "Create EventList page component in frontend/src/pages/events/EventList.tsx"
Task: "Create EventCreate form component in frontend/src/pages/events/EventCreate.tsx"
Task: "Create ApprovalQueue page component in frontend/src/pages/events/ApprovalQueue.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Add User Story 6 → Test independently → Deploy/Demo
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Event Creation & Approval)
   - Developer B: User Story 2 (Registration Management)
   - Developer C: User Story 3 (Payment Processing)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests are not included as they were not explicitly requested in the specification
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Backend uses NestJS modules for clear separation of concerns
- Frontend uses React functional components with TypeScript
- Real-time features use WebSocket for capacity and check-in updates