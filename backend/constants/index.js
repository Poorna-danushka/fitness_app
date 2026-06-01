// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  USER_NOT_FOUND: 'User not found',
  UNAUTHORIZED: 'Unauthorized access',
  INVALID_TOKEN: 'Invalid or expired token',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  VALIDATION_ERROR: 'Validation error',
  PAYMENT_FAILED: 'Payment processing failed',
  SUBSCRIPTION_NOT_FOUND: 'Subscription not found',
  INVALID_REQUEST: 'Invalid request',
  EMAIL_NOT_VERIFIED: 'Email not verified',
  ACCOUNT_LOCKED: 'Account is locked. Try again after 30 minutes.',
  MAX_LOGIN_ATTEMPTS: 'Maximum login attempts exceeded',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'User registered successfully',
  LOGIN_SUCCESS: 'Login successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  LOGOUT_SUCCESS: 'Logout successful',
  PAYMENT_SUCCESS: 'Payment processed successfully',
  SUBSCRIPTION_CREATED: 'Subscription created successfully',
  SUBSCRIPTION_CANCELLED: 'Subscription cancelled successfully',
};

// JWT
export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  EMAIL_VERIFICATION_EXPIRY: '24h',
};

// Password Requirements
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SYMBOLS: true,
};

// Rate Limiting
export const RATE_LIMIT = {
  AUTH_WINDOW: 15 * 60 * 1000,
  AUTH_MAX_REQUESTS: 5,
  API_WINDOW: 60 * 1000,
  API_MAX_REQUESTS: 100,
  LOGIN_ATTEMPTS_MAX: 5,
  LOGIN_ATTEMPTS_WINDOW: 30 * 60 * 1000,
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  PREMIUM: 'premium',
};

// Subscription Status
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  PAUSED: 'paused',
  EXPIRED: 'expired',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

// Email Types
export const EMAIL_TYPES = {
  VERIFICATION: 'verification',
  PASSWORD_RESET: 'password_reset',
  WELCOME: 'welcome',
  SUBSCRIPTION_CONFIRMED: 'subscription_confirmed',
  PAYMENT_RECEIPT: 'payment_receipt',
};
