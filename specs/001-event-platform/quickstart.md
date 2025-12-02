# Quick Start Guide: Event Management Platform

**Feature**: Comprehensive Event Management Platform
**Date**: 2025-12-01
**Purpose**: Developer onboarding and implementation guidance

## Overview

This guide provides step-by-step instructions for implementing the Event Management Platform based on the specification and design artifacts. Follow this sequence to build a working MVP that supports the core user workflows.

## Prerequisites

**Required Tools**:
- Node.js 20+
- npm or yarn
- PostgreSQL 15+
- Redis 7+
- Git

**Development Environment**:
- VS Code or similar IDE
- Docker (recommended for services)
- Postman or similar API testing tool

## Quick Setup (5 minutes)

### 1. Clone and Initialize

```bash
# Clone repository
git clone <repository-url>
cd event-app

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
```

### 2. Database Setup

```bash
# Using Docker (recommended)
docker-compose up -d postgres redis

# Or install locally
# PostgreSQL: https://postgresql.org/download/
# Redis: https://redis.io/download/
```

### 3. Environment Configuration

Edit `.env.local`:

```env
# Database
DATABASE_URL="postgresql://eventuser:eventpass@localhost:5432/eventdb"
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-key-here"
JWT_EXPIRES_IN="24h"

# Email (for notifications)
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT="587"
SMTP_USER="your-smtp-user"
SMTP_PASS="your-smtp-password"

# Payments (development)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# File uploads
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="10MB"
```

### 4. Start Development

```bash
# Run database migrations
npm run migrate

# Seed initial data
npm run seed

# Start development servers (parallel)
npm run dev:backend  # Port 3000
npm run dev:frontend # Port 5173
```

**Expected Result**: Backend API at `http://localhost:3000`, Frontend at `http://localhost:5173`

## Implementation Phases

### Phase 1: Core Authentication & Events (Week 1-2)

**Priority**: P1 - Foundation for all other features

**Backend Tasks** (start here):

1. **Setup NestJS Project Structure**
   ```bash
   nest new backend
   cd backend
   npm install @nestjs/typeorm @nestjs/passport @nestjs/jwt
   npm install typeorm pg class-validator class-transformer
   ```

2. **Database Schema Creation**
   - Implement entities from `data-model.md`
   - Create migration files
   - Setup database connection module

3. **Authentication Module**
   ```typescript
   // Key files to create:
   // src/auth/auth.module.ts
   // src/auth/auth.controller.ts
   // src/auth/auth.service.ts
   // src/auth/jwt.strategy.ts
   // src/auth/roles.guard.ts
   ```

4. **Event Management Module**
   ```typescript
   // Key files to create:
   // src/events/events.module.ts
   // src/events/events.controller.ts
   // src/events/events.service.ts
   // src/events/entities/event-project.entity.ts
   ```

**Frontend Tasks** (parallel with backend):

1. **Setup React + TypeScript Project**
   ```bash
   create-react-app frontend --template typescript
   cd frontend
   npm install @mui/material @mui/icons-material
   npm install react-router-dom @types/react-router-dom
   npm install axios react-query @tanstack/react-query
   ```

2. **Authentication UI**
   ```typescript
   // Key files to create:
   // src/pages/Login.tsx
   // src/components/AuthProvider.tsx
   // src/hooks/useAuth.ts
   // src/services/auth.service.ts
   ```

3. **Event Management UI**
   ```typescript
   // Key files to create:
   // src/pages/Events/EventList.tsx
   // src/pages/Events/EventCreate.tsx
   // src/components/EventCard.tsx
   ```

**Testing Strategy**:
- Unit tests for auth service and event CRUD
- Integration tests for API endpoints
- E2E test for login and event creation flow

### Phase 2: Registration & Capacity Management (Week 3-4)

**Priority**: P2 - Core revenue-generating functionality

**Key Features**:
- Online registration workflow
- Real-time capacity tracking
- Basic payment integration (Stripe test mode)
- Registration confirmation emails

**Backend Implementation**:
```typescript
// New modules to create:
// src/registration/registration.module.ts
// src/participants/participants.module.ts
// src/payments/payments.module.ts (basic Stripe)
// src/notifications/notifications.module.ts
```

**Frontend Implementation**:
```typescript
// New components to create:
// src/pages/Registration/EventRegistration.tsx
// src/components/PaymentForm.tsx
// src/hooks/useRegistration.ts
```

**WebSocket Integration**:
```typescript
// Real-time capacity updates:
// backend/src/gateway/capacity.gateway.ts
// frontend/src/hooks/useRealTimeCapacity.ts
```

### Phase 3: Check-in & Staff Operations (Week 5)

**Priority**: P4 - Operational efficiency

**Key Features**:
- Staff check-in interface
- Participant search and verification
- Walk-in registration handling

**Implementation**:
```typescript
// Backend:
// src/check-in/check-in.module.ts

// Frontend:
// src/pages/CheckIn/CheckInDashboard.tsx
// src/pages/CheckIn/ParticipantSearch.tsx
```

### Phase 4: Reporting & Analytics (Week 6)

**Priority**: P6 - Business intelligence

**Key Features**:
- Post-event reports
- PDF/Excel export
- Analytics dashboard

**Implementation**:
```typescript
// Backend:
// src/reports/reports.module.ts
// src/reports/generators/pdf.generator.ts
// src/reports/generators/excel.generator.ts

// Frontend:
// src/pages/Dashboard/Analytics.tsx
// src/pages/Reports/ReportGeneration.tsx
```

## Development Guidelines

### Code Organization

**Backend Structure**:
```
backend/src/
├── auth/           # Authentication & authorization
├── events/         # Event projects & batches
├── registration/   # Registration workflow
├── payments/       # Payment processing
├── check-in/       # Check-in operations
├── reports/        # Analytics & reporting
├── shared/         # Common utilities
├── database/       # Entities, migrations
└── main.ts
```

**Frontend Structure**:
```
frontend/src/
├── components/     # Reusable components
├── pages/          # Route components
├── services/       # API clients
├── hooks/          # Custom React hooks
├── store/          # State management
├── types/          # TypeScript definitions
└── utils/          # Helper functions
```

### API Integration

**HTTP Client Setup**:
```typescript
// frontend/src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Type-Safe API Calls**:
```typescript
// Use OpenAPI generated types
import { EventProject, EventProjectCreate } from '../types/api';

export const eventsService = {
  getAll: (): Promise<EventProject[]> => api.get('/events').then(res => res.data),
  create: (data: EventProjectCreate): Promise<EventProject> =>
    api.post('/events', data).then(res => res.data),
  // ... other methods
};
```

### Testing Strategy

**Backend Tests**:
```typescript
// Unit tests (Jest)
// tests/unit/events/events.service.spec.ts

// Integration tests (Supertest)
// tests/integration/auth.e2e-spec.ts

// Database tests (Test containers)
// tests/database/events.repository.spec.ts
```

**Frontend Tests**:
```typescript
// Component tests (React Testing Library)
// src/components/__tests__/EventCard.test.tsx

// Hook tests (React Hooks Testing Library)
// src/hooks/__tests__/useAuth.test.ts

// E2E tests (Cypress)
// cypress/e2e/event-creation.cy.ts
```

### Database Management

**Migrations**:
```typescript
// Create new migration
npm run migration:create -- AddEventBatchTable

// Run migrations
npm run migration:run

// Revert migration
npm run migration:revert
```

**Seeding Data**:
```typescript
// Development seed data
// database/seeds/01-users.seed.ts
// database/seeds/02-foundation-templates.seed.ts
```

## Deployment

### Development Deployment

**Docker Compose**:
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports: ['3000:3000']
    environment:
      - NODE_ENV=development
    depends_on: [postgres, redis]

  frontend:
    build: ./frontend
    ports: ['5173:5173']
    environment:
      - REACT_APP_API_URL=http://localhost:3000/api/v1
```

### Production Deployment

**Environment Checklist**:
- [ ] Database connection string (production)
- [ ] Redis connection string (production)
- [ ] JWT secret (secure random)
- [ ] SMTP configuration (production email service)
- [ ] Payment gateway keys (production)
- [ ] File upload storage (S3 or equivalent)
- [ ] SSL certificates configured
- [ ] Environment variables secured
- [ ] Database migrations applied
- [ ] Health checks configured

## Troubleshooting

### Common Issues

**Database Connection Failed**:
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check connection string format
DATABASE_URL="postgresql://user:pass@host:port/dbname"
```

**Authentication Errors**:
```bash
# Verify JWT secret is set
echo $JWT_SECRET

# Check token expiration
# Tokens default to 24h, adjust JWT_EXPIRES_IN if needed
```

**Registration Capacity Issues**:
```bash
# Check Redis connection for real-time updates
redis-cli ping

# Verify WebSocket connection in browser dev tools
# Look for WebSocket connection in Network tab
```

### Performance Monitoring

**Key Metrics to Track**:
- API response times (target: <200ms p95)
- Registration completion rate (target: >95%)
- Payment success rate (target: >99%)
- Database query performance
- WebSocket connection stability

**Monitoring Tools**:
- Backend: Winston logging + Prometheus metrics
- Frontend: React DevTools + performance profiling
- Database: PostgreSQL query analysis
- Infrastructure: Docker stats + system metrics

## Next Steps

1. **Complete Phase 1 Implementation** (2 weeks)
   - Focus on authentication and basic event management
   - Ensure solid foundation before adding complexity

2. **User Testing & Feedback** (1 week)
   - Deploy Phase 1 to staging
   - Gather feedback from test users
   - Iterate on UX/UI based on feedback

3. **Scale Planning** (ongoing)
   - Monitor performance metrics
   - Plan for horizontal scaling when needed
   - Optimize database queries and caching

4. **Security Hardening** (ongoing)
   - Regular security audits
   - Penetration testing
   - Dependency vulnerability scanning

For detailed API documentation, refer to `contracts/openapi.yaml`. For complete data model specifications, see `data-model.md`.