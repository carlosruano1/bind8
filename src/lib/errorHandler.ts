import { NextResponse } from 'next/server';

export interface AppError extends Error {
  statusCode: number;
  code?: string;
  details?: any;
}

export class ValidationError extends Error implements AppError {
  statusCode = 400;
  code = 'VALIDATION_ERROR';
  
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error implements AppError {
  statusCode = 401;
  code = 'AUTHENTICATION_ERROR';
  
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error implements AppError {
  statusCode = 403;
  code = 'AUTHORIZATION_ERROR';
  
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error implements AppError {
  statusCode = 404;
  code = 'NOT_FOUND';
  
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error implements AppError {
  statusCode = 409;
  code = 'CONFLICT';
  
  constructor(message: string = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends Error implements AppError {
  statusCode = 429;
  code = 'RATE_LIMIT_EXCEEDED';
  
  constructor(message: string = 'Too many requests', public retryAfter?: number) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class InternalServerError extends Error implements AppError {
  statusCode = 500;
  code = 'INTERNAL_SERVER_ERROR';
  
  constructor(message: string = 'Internal server error') {
    super(message);
    this.name = 'InternalServerError';
  }
}

export function handleError(error: unknown): NextResponse {
  console.error('API Error:', error);
  
  // Handle known app errors
  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details
      },
      { status: error.statusCode }
    );
  }
  
  if (error instanceof AuthenticationError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code
      },
      { status: error.statusCode }
    );
  }
  
  if (error instanceof AuthorizationError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code
      },
      { status: error.statusCode }
    );
  }
  
  if (error instanceof NotFoundError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code
      },
      { status: error.statusCode }
    );
  }
  
  if (error instanceof ConflictError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code
      },
      { status: error.statusCode }
    );
  }
  
  if (error instanceof RateLimitError) {
    const headers: Record<string, string> = {};
    if (error.retryAfter) {
      headers['Retry-After'] = error.retryAfter.toString();
    }
    
    return NextResponse.json(
      {
        error: error.message,
        code: error.code
      },
      { 
        status: error.statusCode,
        headers
      }
    );
  }
  
  if (error instanceof InternalServerError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code
      },
      { status: error.statusCode }
    );
  }
  
  // Handle Supabase errors
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as any;
    
    switch (supabaseError.code) {
      case '23505': // Unique violation
        return NextResponse.json(
          {
            error: 'Resource already exists',
            code: 'DUPLICATE_RESOURCE'
          },
          { status: 409 }
        );
      
      case '23503': // Foreign key violation
        return NextResponse.json(
          {
            error: 'Referenced resource not found',
            code: 'REFERENCE_ERROR'
          },
          { status: 400 }
        );
      
      case '42P01': // Undefined table
        return NextResponse.json(
          {
            error: 'Database configuration error',
            code: 'DATABASE_ERROR'
          },
          { status: 500 }
        );
      
      default:
        return NextResponse.json(
          {
            error: 'Database operation failed',
            code: 'DATABASE_ERROR',
            details: process.env.NODE_ENV === 'development' ? supabaseError.message : undefined
          },
          { status: 500 }
        );
    }
  }
  
  // Handle unknown errors
  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR'
    },
    { status: 500 }
  );
}

// Utility function to wrap async handlers with error handling
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args);
    } catch (error) {
      throw error; // Let the calling function handle it
    }
  };
}

// Validation helper
export function validateRequired(data: any, fields: string[]): void {
  for (const field of fields) {
    if (!data[field] && data[field] !== 0) {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  }
}

// Authentication helper
export function requireAuth(user: any): void {
  if (!user) {
    throw new AuthenticationError();
  }
}

// Authorization helper
export function requireRole(user: any, requiredRole: string): void {
  requireAuth(user);
  
  if (user.role !== requiredRole) {
    throw new AuthorizationError(`Role ${requiredRole} required`);
  }
}
