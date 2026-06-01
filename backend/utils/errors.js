import { HTTP_STATUS } from '../constants/index.js';

export class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, HTTP_STATUS.BAD_REQUEST);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, HTTP_STATUS.UNAUTHORIZED);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, HTTP_STATUS.FORBIDDEN);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, HTTP_STATUS.NOT_FOUND);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message) {
    super(message, HTTP_STATUS.CONFLICT);
    this.name = 'ConflictError';
  }
}

export class PaymentError extends AppError {
  constructor(message = 'Payment processing failed') {
    super(message, HTTP_STATUS.BAD_REQUEST);
    this.name = 'PaymentError';
  }
}
