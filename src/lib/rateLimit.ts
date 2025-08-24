import { NextRequest, NextResponse } from 'next/server';

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (req: NextRequest) => string;
}

export function createRateLimiter(config: RateLimitConfig) {
  const { maxRequests, windowMs, keyGenerator } = config;

  return function rateLimit(req: NextRequest) {
    const key = keyGenerator ? keyGenerator(req) : getClientIP(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get current rate limit data
    const current = rateLimitStore.get(key);
    
    if (!current || current.resetTime < now) {
      // First request or window expired
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return null; // No rate limit hit
    }

    if (current.count >= maxRequests) {
      // Rate limit exceeded
      return NextResponse.json(
        { 
          error: 'Too many requests', 
          retryAfter: Math.ceil((current.resetTime - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(current.resetTime).toISOString()
          }
        }
      );
    }

    // Increment counter
    current.count++;
    rateLimitStore.set(key, current);
    
    return null; // No rate limit hit
  };
}

function getClientIP(req: NextRequest): string {
  // Try to get real IP from various headers
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to a default key if no IP found
  return 'unknown';
}

// Predefined rate limiters for different use cases
export const authRateLimit = createRateLimiter({
  maxRequests: 5, // 5 attempts per window
  windowMs: 15 * 60 * 1000, // 15 minutes
  keyGenerator: (req) => `auth:${getClientIP(req)}`
});

export const apiRateLimit = createRateLimiter({
  maxRequests: 100, // 100 requests per window
  windowMs: 60 * 1000, // 1 minute
  keyGenerator: (req) => `api:${getClientIP(req)}`
});

export const uploadRateLimit = createRateLimiter({
  maxRequests: 10, // 10 uploads per window
  windowMs: 60 * 1000, // 1 minute
  keyGenerator: (req) => `upload:${getClientIP(req)}`
});

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute
