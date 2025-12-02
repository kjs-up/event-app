"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheKeys = exports.PaymentMethod = exports.PaymentStatus = exports.RegistrationStatus = exports.EventType = exports.EventStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["MAKER"] = "maker";
    UserRole["APPROVER"] = "approver";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var EventStatus;
(function (EventStatus) {
    EventStatus["DRAFT"] = "draft";
    EventStatus["PENDING_APPROVAL"] = "pending_approval";
    EventStatus["APPROVED"] = "approved";
    EventStatus["REJECTED"] = "rejected";
    EventStatus["ARCHIVED"] = "archived";
})(EventStatus || (exports.EventStatus = EventStatus = {}));
var EventType;
(function (EventType) {
    EventType["TRAINING"] = "training";
    EventType["SEMINAR"] = "seminar";
    EventType["CONCERT"] = "concert";
    EventType["ENTERTAINMENT"] = "entertainment";
    EventType["FOUNDATION"] = "foundation";
})(EventType || (exports.EventType = EventType = {}));
var RegistrationStatus;
(function (RegistrationStatus) {
    RegistrationStatus["PENDING"] = "pending";
    RegistrationStatus["CONFIRMED"] = "confirmed";
    RegistrationStatus["CANCELLED"] = "cancelled";
    RegistrationStatus["WAITLISTED"] = "waitlisted";
    RegistrationStatus["CHECKED_IN"] = "checked_in";
})(RegistrationStatus || (exports.RegistrationStatus = RegistrationStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PROCESSING"] = "processing";
    PaymentStatus["COMPLETED"] = "completed";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["CANCELLED"] = "cancelled";
    PaymentStatus["REFUNDED"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CREDIT_CARD"] = "credit_card";
    PaymentMethod["QR_CODE"] = "qr_code";
    PaymentMethod["BANK_TRANSFER"] = "bank_transfer";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
exports.CacheKeys = {
    USER_PROFILE: (userId) => `user:profile:${userId}`,
    USER_PERMISSIONS: (userId) => `user:permissions:${userId}`,
    EVENT_DETAILS: (eventId) => `event:details:${eventId}`,
    EVENT_CAPACITY: (batchId) => `event:capacity:${batchId}`,
    REGISTRATION_COUNT: (batchId) => `registration:count:${batchId}`,
    SESSION: (sessionId) => `session:${sessionId}`,
};
//# sourceMappingURL=index.js.map