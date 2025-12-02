export declare enum UserRole {
    MAKER = "maker",
    APPROVER = "approver",
    ADMIN = "admin"
}
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    lastLogin?: string;
    fullName?: string;
}
export interface CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
}
export interface LoginDto {
    email: string;
    password: string;
}
export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export declare enum EventStatus {
    DRAFT = "draft",
    PENDING_APPROVAL = "pending_approval",
    APPROVED = "approved",
    REJECTED = "rejected",
    ARCHIVED = "archived"
}
export declare enum EventType {
    TRAINING = "training",
    SEMINAR = "seminar",
    CONCERT = "concert",
    ENTERTAINMENT = "entertainment",
    FOUNDATION = "foundation"
}
export interface EventProject {
    id: string;
    name: string;
    description?: string;
    eventType: EventType;
    foundationTemplateId?: string;
    maxCapacity: number;
    isPaid: boolean;
    basePrice?: number;
    currency: string;
    hasSpeakers: boolean;
    status: EventStatus;
    creatorId: string;
    approverId?: string;
    createdAt: string;
    updatedAt: string;
    approvedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
}
export interface CreateEventProjectDto {
    name: string;
    description?: string;
    eventType: EventType;
    foundationTemplateId?: string;
    maxCapacity: number;
    isPaid: boolean;
    basePrice?: number;
    currency?: string;
    hasSpeakers: boolean;
}
export declare enum RegistrationStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    CANCELLED = "cancelled",
    WAITLISTED = "waitlisted",
    CHECKED_IN = "checked_in"
}
export interface Participant {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    organization?: string;
    dietaryRestrictions?: string;
    accessibilityNeeds?: string;
    createdAt: string;
    updatedAt: string;
    fullName?: string;
}
export interface Registration {
    id: string;
    participantId: string;
    eventBatchId: string;
    status: RegistrationStatus;
    registrationType: 'online' | 'walk-in';
    paymentId?: string;
    paymentStatus?: PaymentStatus;
    checkInTime?: string;
    createdAt: string;
    updatedAt: string;
    participant?: Participant;
}
export interface CreateRegistrationDto {
    eventBatchId: string;
    participant: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        organization?: string;
        dietaryRestrictions?: string;
        accessibilityNeeds?: string;
    };
    registrationType: 'online' | 'walk-in';
}
export declare enum PaymentStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
    REFUNDED = "refunded"
}
export declare enum PaymentMethod {
    CREDIT_CARD = "credit_card",
    QR_CODE = "qr_code",
    BANK_TRANSFER = "bank_transfer"
}
export interface Payment {
    id: string;
    registrationId: string;
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    paymentIntentId?: string;
    transactionId?: string;
    receiptUrl?: string;
    failureReason?: string;
    processedAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface CreatePaymentDto {
    registrationId: string;
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
}
export interface Speaker {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    bio?: string;
    title?: string;
    company?: string;
    profileImageUrl?: string;
    socialLinks?: Record<string, string>;
    createdAt: string;
    updatedAt: string;
    fullName?: string;
}
export interface CreateSpeakerDto {
    firstName: string;
    lastName: string;
    email: string;
    bio?: string;
    title?: string;
    company?: string;
    socialLinks?: Record<string, string>;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: string[];
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}
export interface PaginationQuery {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface ErrorResponse {
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
    message: string | string[];
    error?: string;
    details?: any;
    requestId?: string;
}
export interface WebSocketMessage<T = any> {
    type: string;
    data: T;
    timestamp: string;
    requestId?: string;
}
export interface CapacityUpdateMessage {
    eventBatchId: string;
    totalCapacity: number;
    registeredCount: number;
    availableSpots: number;
    waitlistCount: number;
}
export interface CheckInUpdateMessage {
    eventBatchId: string;
    participantId: string;
    participantName: string;
    checkInTime: string;
    totalCheckedIn: number;
}
export declare const CacheKeys: {
    readonly USER_PROFILE: (userId: string) => string;
    readonly USER_PERMISSIONS: (userId: string) => string;
    readonly EVENT_DETAILS: (eventId: string) => string;
    readonly EVENT_CAPACITY: (batchId: string) => string;
    readonly REGISTRATION_COUNT: (batchId: string) => string;
    readonly SESSION: (sessionId: string) => string;
};
export interface DatabaseConfig {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
    logging: boolean;
}
export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    db: number;
    ttl: number;
}
export interface JwtConfig {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
}
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type Timestamps = {
    createdAt: string;
    updatedAt: string;
};
export type EntityWithTimestamps<T> = T & Timestamps;
//# sourceMappingURL=index.d.ts.map