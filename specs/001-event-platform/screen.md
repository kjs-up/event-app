# Event Management Platform - Screen Analysis

## วิเคราะห์จาก Requirements และ User Journey

จากการศึกษา requirements จาก `requireNextVersion.md` (80 requirements) และ user stories จาก `userJourney.md` (6 user stories) สรุปได้ว่าระบบต้องการทั้งหมด **15 หน้าจอหลัก** แบ่งตาม user flow ดังนี้:

---

## 📊 สรุปภาพรวม Screens

| User Flow | จำนวน Screens | Priority | Requirements ที่รองรับ |
|-----------|---------------|----------|---------------------|
| **Customer Event Registration** | 3 screens | P0 (Critical) | REQ-015 ถึง REQ-023 |
| **Public Attendee Journey** | 4 screens | P0 (Critical) | REQ-006 ถึง REQ-014, REQ-073 |
| **Event Organizer Management** | 4 screens | P1-P2 (High-Medium) | REQ-001 ถึง REQ-005, REQ-024 ถึง REQ-037, REQ-074 |
| **Staff Operations** | 2 screens | P1 (High) | REQ-005, REQ-008, REQ-075 |
| **Administrative Control** | 2 screens | P0-P1 (Critical-High) | REQ-018, REQ-020, REQ-047 ถึง REQ-072 |

**รวมทั้งหมด: 15 หน้าจอหลัก**

---

## 🎯 User Story 1: Customer Event Registration Portal (Priority P1)

### SCR-001: Customer Event Request Form
**วัตถุประสงค์**: หน้าฟอร์มสำหรับลูกค้าส่งคำขอสร้าง event ใหม่
**ใช้โดย**: External Customers/Clients
**Priority**: P0 (Critical)

**หน้าที่หลัก**:
- รับข้อมูลพื้นฐานของ event (ชื่อ, วันที่, สถานที่, จำนวนผู้เข้าร่วม)
- ให้เลือก features/modules ที่ต้องการ:
  - ✅ Basic Ticketing (free/paid tickets)
  - ✅ Advanced Ticketing (promo codes, group discounts)
  - ✅ Seat Mapping & Reservations
  - ✅ VIP & Speaker Management
  - ✅ Multi-currency Payments
  - ✅ Thai/English Support
  - ✅ Analytics & Reporting
  - ✅ Survey & Feedback Tools
- แสดงราคาประเมินแบบ real-time ตาม features ที่เลือก
- อัพโหลดไฟล์เอกสารประกอบ (event brief, venue layout)
- บันทึก draft และส่งคำขอ

**Requirements ที่รองรับ**: REQ-015, REQ-016, REQ-021

---

### SCR-002: Customer Request Dashboard
**วัตถุประสงค์**: หน้าติดตามสถานะคำขอ event ของลูกค้า
**ใช้โดย**: Event Customers
**Priority**: P0 (Critical)

**หน้าที่หลัก**:
- แสดงสถานะของทุกคำขอ:
  - 📝 **Submitted** - รอการพิจารณา
  - 🔍 **Under Review** - กำลังตรวจสอบ
  - ✅ **Approved** - อนุมัติแล้ว รอการยืนยัน
  - ✔️ **Confirmed** - ยืนยันแล้ว เตรียมเปิดตัว
  - 🚀 **Live** - event เปิดใช้งานแล้ว
  - 🏁 **Completed** - event จบแล้ว
- Timeline แสดงความคืบหน้า
- ระบบแชทกับทีมงาน admin
- ดาวน์โหลดเอกสาร contracts และ approvals
- ปุ่ม actions ตามสถานะ (Edit Draft, Confirm Approval, View Live Event)

**Requirements ที่รองรับ**: REQ-017, REQ-022, REQ-023

---

### SCR-003: Admin Event Request Review Center
**วัตถุประสงค์**: หน้าสำหรับ admin ตรวจสอบและอนุมัติคำขอ event
**ใช้โดย**: Platform Administrators, Sales Team
**Priority**: P0 (Critical)

**หน้าที่หลัก**:
- Queue management ของคำขอทั้งหมด
- Filter และ sort ตาม status, วันที่, ความซับซ้อน
- Review interface แสดง:
  - ข้อมูลลูกค้าและประวัติ
  - รายละเอียด event ที่ต้องการ
  - Features ที่เลือกและผลกระทบด้านต้นทุน
  - ไฟล์เอกสารที่อัพโหลด
- เครื่องมือ approval:
  - อนุมัติพร้อมแก้ไขข้อเสนอ
  - ขอข้อมูลเพิ่มเติม
  - ปฏิเสธพร้อมเหตุผล
- ประเมินต้นทุนและกำหนดราคา
- Internal comments สำหรับทีมงาน

**Requirements ที่รองรับ**: REQ-018, REQ-019

---

## 🎫 User Story 2: Advanced Ticketing and Payment System (Priority P1)

### SCR-004: Public Event Marketplace
**วัตถุประสงค์**: หน้าค้นหาและเลือก events สำหรับคนทั่วไป
**ใช้โดย**: Public Users, Potential Attendees
**Priority**: P0 (Critical)

**หน้าที่หลัก**:
- Hero section พร้อม search bar
- Filter events ตาม:
  - ประเภท event (concerts, tech talks, motor shows, seminars)
  - ช่วงวันที่
  - พื้นที่และรัศมี
  - ช่วงราคา
  - ภาษา (ไทย/อังกฤษ)
- แสดง event cards พร้อมข้อมูล:
  - รูปภาพ, ชื่อ, วันที่, สถานที่
  - ช่วงราคา, availability
  - ปุ่ม View Details, Buy Tickets
- การค้นหา real-time พร้อม autocomplete
- แนะนำ events ตาม location
- Language toggle (Thai/English)

**Requirements ที่รองรับ**: REQ-001, REQ-002, REQ-038, REQ-073

---

### SCR-005: Event Details & Ticket Purchase
**วัตถุประสงค์**: หน้าแสดงรายละเอียด event และซื้อ tickets
**ใช้โดย**: Potential Attendees
**Priority**: P0 (Critical)

**หน้าที่หลัก**:
- Event header พร้อม banner, ชื่อ, วันที่, venue
- รายละเอียด event พร้อม rich media
- Ticket selection widget:
  - ticket tiers พร้อมราคา
  - quantity selectors
  - promo code input
  - group discount information
- ข้อมูล venue พร้อม interactive map
- โปรไฟล์ speakers/performers (ถ้ามี)
- Schedule/agenda สำหรับ multi-session events
- Reviews และ ratings จากผู้เข้าร่วมก่อนหน้า
- ปุ่มแชร์ social media

**Requirements ที่รองรับ**: REQ-009, REQ-010, REQ-024, REQ-038

---

### SCR-006: Interactive Seat Selection (เฉพาะ events ที่มี reserved seating)
**วัตถุประสงค์**: หน้าเลือกที่นั่งแบบ interactive พร้อม real-time availability
**ใช้โดย**: Attendees ที่ซื้อ reserved seating
**Priority**: P1 (High)

**หน้าที่หลัก**:
- Interactive venue map พร้อม zoom/pan
- Seat availability legend:
  - ว่าง (เขียว), เลือกแล้ว (น้ำเงิน), ถูกจองโดยคนอื่น (เหลือง), ขายแล้ว (แดง)
  - ที่นั่งสำหรับผู้พิการ (มีสัญลักษณ์)
- Price zone indicators แยกสีตามราคา
- Seat information panel (section, row, seat number, ราคา)
- Selection summary พร้อม countdown timer (5 นาที)
- Best available suggestions สำหรับเลือกอัตโนมัติ
- Accessibility filters สำหรับที่นั่งผู้พิการ

**Requirements ที่รองรับ**: REQ-026, REQ-027

---

### SCR-007: Checkout & Payment Processing
**วัตถุประสงค์**: หน้า checkout และชำระเงินแบบ multi-currency
**ใช้โดย**: Attendees ที่ซื้อ tickets
**Priority**: P0 (Critical)

**หน้าที่หลัก**:
- Order summary พร้อมรายละเอียด seats/tickets และการคำนวณราคา
- Customer information form พร้อม KYC data collection
- Payment method selection:
  - บัตรเครดิต/เดบิต (Stripe integration)
  - Digital wallets (Apple Pay, Google Pay)
  - การชำระเงินท้องถิน (PromptPay สำหรับไทย)
  - Bank transfer options
- Tax calculation display ตาม jurisdiction
- Terms and conditions acceptance
- Security badges และ SSL indicators
- Processing status พร้อม success/error handling

**Requirements ที่รองรับ**: REQ-013, REQ-014, REQ-029, REQ-052

---

## 🎪 User Story 3 & 4: Event Management & Analytics (Priority P1-P2)

### SCR-008: Event Organizer Dashboard
**วัตถุประสงค์**: หน้า dashboard หลักสำหรับ event organizers
**ใช้โดย**: Event Organizers
**Priority**: P1 (High)

**หน้าที่หลัก**:
- KPI cards แสดงข้อมูล real-time:
  - Tickets sold vs capacity
  - Revenue vs target
  - Check-in percentage
  - NPS score และ feedback rating
- Quick action buttons:
  - Edit Event Details
  - Manage Tickets & Pricing
  - View Analytics Reports
  - Send Notifications
- Recent activity feed พร้อม attendee registrations
- Performance charts แสดง sales trends และ engagement
- Event status indicators พร้อม next action items
- Navigation menu ไปยังฟังก์ชัน event management ทั้งหมด

**Requirements ที่รองรับ**: REQ-036, REQ-065, REQ-074

---

### SCR-009: Event Creation Wizard
**วัตถุประสงค์**: หน้าสร้าง event ใหม่แบบ step-by-step
**ใช้โดย**: Event Organizers
**Priority**: P1 (High)

**หน้าที่หลัก**:
- Multi-step wizard พร้อม progress indicator:
  - Step 1: Basic event information
  - Step 2: Venue และ capacity setup
  - Step 3: Ticketing configuration
  - Step 4: VIP และ speaker management
  - Step 5: Payment และ tax settings
  - Step 6: Survey และ feedback setup
  - Step 7: Preview และ publish
- Module activation toggles สำหรับ:
  - Basic vs Advanced ticketing
  - Seat mapping enablement
  - VIP management features
  - Multi-language support
  - Analytics และ reporting level
- Template selection พร้อม pre-configured settings
- Preview mode แสดง attendee experience
- Validation checks ก่อน publishing

**Requirements ที่รองรับ**: REQ-028, REQ-074

---

### SCR-010: Analytics & Reporting Center
**วัตถุประสงค์**: หน้าวิเคราะห์ข้อมูลและรายงานแบบครอบคลุม
**ใช้โดย**: Event Organizers, Platform Administrators
**Priority**: P2 (Medium)

**หน้าที่หลัก**:
- Interactive dashboard พร้อม customizable widgets:
  - Revenue tracking ตามช่วงเวลา
  - Attendance patterns และ demographics
  - Ticket sales conversion funnel
  - Geographic distribution ของผู้เข้าร่วม
  - Payment method preferences
- Report builder พร้อม drag-and-drop interface
- Filter และ drill-down controls:
  - Date range selection
  - Event type filtering
  - Demographic segmentation
  - Geographic filtering
- Export options (PDF, CSV, Excel)
- Scheduled reports setup
- Sharing capabilities กับ stakeholders

**Requirements ที่รองรับ**: REQ-036, REQ-066, REQ-067, REQ-068

---

### SCR-011: Survey & Feedback Management
**วัตถุประสงค์**: หน้าจัดการ surveys และรวบรวม feedback
**ใช้โดย**: Event Organizers
**Priority**: P2 (Medium)

**หน้าที่หลัก**:
- Survey builder พร้อม template library:
  - Pre-event expectation surveys
  - Live polls ระหว่าง sessions
  - Post-event satisfaction surveys
  - Speaker rating forms
- Question types support:
  - Multiple choice พร้อม single/multiple selection
  - Rating scales (1-10, emoji, stars)
  - Text input (short/long form)
  - File upload สำหรับ images/documents
- Logic branching สำหรับ conditional questions
- Response analytics พร้อม:
  - Sentiment analysis ของ text responses
  - NPS calculation และ trending
  - Response rate tracking
  - Demographic correlation

**Requirements ที่รองรับ**: REQ-034, REQ-035, REQ-036, REQ-037

---

## 👥 User Story 5 & 6: User Management & VIP Features (Priority P2-P3)

### SCR-012: Digital Ticket Wallet
**วัตถุประสงค์**: หน้า wallet สำหรับเก็บและจัดการ tickets
**ใช้โดย**: Attendees
**Priority**: P0 (Critical)

**หน้าที่หลัก**:
- Ticket library แสดง tickets ทั้งหมด:
  - Upcoming events พร้อม countdown timers
  - Past events พร้อมการเข้าถึง memories/photos
  - Transferred tickets พร้อมประวัติ
  - Refunded/cancelled tickets
- Ticket details view พร้อม:
  - QR code สำหรับ check-in
  - Event information และ venue details
  - Seat assignment (สำหรับ reserved seating)
  - Transfer และ refund options
- Transfer interface พร้อม:
  - OTP-powered secure transfer process
  - Recipient email/phone verification
  - Transfer fee calculation
  - Transfer history และ audit trail
- Mobile wallet integration:
  - Apple Wallet pass generation
  - Google Pay pass creation
  - Offline QR code access

**Requirements ที่รองรับ**: REQ-011, REQ-012

---

### SCR-013: VIP & Speaker Management Center
**วัตถุประสงค์**: หน้าจัดการ VIPs และ speakers
**ใช้โดย**: Event Organizers
**Priority**: P3 (Low)

**หน้าที่หลัก**:
- VIP management interface:
  - VIP category creation พร้อม custom perks
  - Guest list management พร้อม status tracking
  - Access level configuration (lounge, backstage, etc.)
  - Communication tools สำหรับ VIP coordination
- Speaker management system:
  - Speaker profile creation พร้อม bio และ photos
  - Session assignment และ scheduling
  - Travel และ accommodation coordination
  - Contract และ payment tracking
- Perks และ access control:
  - Custom perk definition (meals, gifts, access)
  - QR code generation สำหรับ special access
  - Real-time check-in status monitoring
  - Integration กับ main event check-in system

**Requirements ที่รองรับ**: REQ-024, REQ-025, REQ-076

---

## 🏢 Staff Operations & Administration

### SCR-014: Staff Check-in Portal
**วัตถุประสงค์**: หน้า check-in สำหรับเจ้าหน้าที่
**ใช้โดย**: Check-in Staff, Security Personnel
**Priority**: P1 (High)

**หน้าที่หลัก**:
- QR scanner interface ที่เพิ่มประสิทธิภาพความเร็ว:
  - Camera-based QR code scanning
  - Manual ticket number entry backup
  - Bulk check-in mode สำหรับ groups
  - Sound และ visual feedback สำหรับ successful scans
- Attendee information display:
  - ชื่อ, ประเภท ticket, seat assignment
  - VIP status และ special requirements
  - Photo verification (ถ้ามี)
  - Dietary restrictions และ accessibility needs
- Issue resolution tools:
  - Manual override options
  - Refund processing capability
  - VIP upgrade authorization
  - Support escalation contact
- Real-time statistics แสดง check-in progress

**Requirements ที่รองรับ**: REQ-008, REQ-075

---

### SCR-015: Platform Administration Center
**วัตถุประสงค์**: หน้าจัดการระบบทั้งหมด
**ใช้โดย**: System Administrators
**Priority**: P1 (High)

**หน้าที่หลัก**:
- User management interface:
  - Role และ permission management
  - Bulk user operations
  - Access audit และ compliance reporting
  - SSO configuration และ testing
- System health monitoring:
  - Performance metrics และ alerting
  - Database health และ optimization
  - API usage และ rate limiting status
  - Security threat detection
- Configuration management:
  - Feature flag administration
  - System parameter tuning
  - Integration endpoint management
  - Backup และ disaster recovery controls
- Translation management:
  - Thai/English content management
  - Translation editor interface
  - Language fallback configuration
- Audit logs และ security monitoring

**Requirements ที่รองรับ**: REQ-039, REQ-047, REQ-048, REQ-050, REQ-051, REQ-061, REQ-062, REQ-063

---

## 📱 Screen Flow และ Implementation Priority

### Primary User Journeys

1. **Customer Event Registration Flow** (P0):
   `SCR-001` → `SCR-002` → `SCR-003` (Admin Review)

2. **Public Attendee Flow** (P0):
   `SCR-004` → `SCR-005` → `SCR-006` → `SCR-007` → `SCR-012` → `SCR-014` (Check-in)

3. **Event Organizer Flow** (P1):
   `SCR-008` → `SCR-009` → `SCR-010` → `SCR-011` → (`SCR-013`)

4. **Staff Operations Flow** (P1):
   `SCR-014` → `SCR-015` (Admin functions)

### Implementation Phases

**Phase 1 (MVP - 3 เดือน)**:
`SCR-001`, `SCR-002`, `SCR-003`, `SCR-004`, `SCR-005`, `SCR-007`, `SCR-008`, `SCR-012`, `SCR-014`

**Phase 2 (Core Features - 2 เดือน)**:
`SCR-006`, `SCR-009`, `SCR-010`, `SCR-015`

**Phase 3 (Advanced Features - 2 เดือน)**:
`SCR-011`, `SCR-013`, performance optimization, additional integrations

---

## 🎯 Success Metrics ตาม Screen

| Screen | Target Performance | Requirements Covered |
|--------|-------------------|---------------------|
| **SCR-001** | Process 100+ requests/day, <5min submission | REQ-015, REQ-016, REQ-021 |
| **SCR-004/005** | Support 10K+ concurrent users, <2s load time | REQ-073, REQ-042 |
| **SCR-006/007** | Handle 1K+ concurrent seat selections | REQ-026, REQ-027 |
| **SCR-012** | 99.9% ticket delivery success rate | REQ-011, REQ-012 |
| **SCR-014** | <5s check-in per attendee | REQ-008 |
| **All Screens** | WCAG 2.1 AA compliance, Thai/English support | REQ-038, REQ-062 |

**สรุป: 15 หน้าจอหลักครอบคลุม 80 requirements และ 6 user stories ตามลำดับความสำคัญที่กำหนด**.