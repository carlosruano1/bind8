// Application configuration
export const config = {
  // Database
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!
  },

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!
  },

  // App
  app: {
    name: 'Bind8',
    version: '1.0.0',
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    environment: process.env.NODE_ENV || 'development'
  },

  // Rate Limiting
  rateLimit: {
    auth: {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000 // 15 minutes
    },
    api: {
      maxRequests: 100,
      windowMs: 60 * 1000 // 1 minute
    },
    upload: {
      maxRequests: 10,
      windowMs: 60 * 1000 // 1 minute
    }
  },

  // File Upload
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxFiles: 20
  },

  // Pagination
  pagination: {
    defaultLimit: 20,
    maxLimit: 100
  }
};

// Validation function to check if all required config is present
export function validateConfig(): void {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Feature flags
export const features = {
  analytics: process.env.NODE_ENV === 'production',
  rateLimiting: true,
  errorTracking: process.env.NODE_ENV === 'production',
  caching: process.env.NODE_ENV === 'production'
};
