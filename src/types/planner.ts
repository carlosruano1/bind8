// Service Levels
export const SERVICE_LEVELS = {
  FULL_SERVICE: 'full-service',
  PARTIAL: 'partial',
  DAY_OF: 'day-of',
  MONTH_OF: 'month-of',
  CONSULTATION: 'consultation'
} as const;

// Specialties
export const SPECIALTIES = {
  DESTINATION: 'destination',
  LOCAL: 'local',
  LUXURY: 'luxury',
  BUDGET_FRIENDLY: 'budget-friendly',
  MICRO_WEDDING: 'micro-wedding',
  LARGE_WEDDING: 'large-wedding',
  CULTURAL: 'cultural',
  RELIGIOUS: 'religious',
  LGBTQ: 'lgbtq',
  ECO_FRIENDLY: 'eco-friendly',
  BEACH: 'beach',
  MOUNTAIN: 'mountain',
  URBAN: 'urban',
  RUSTIC: 'rustic',
  VINEYARD: 'vineyard',
  ESTATE: 'estate'
} as const;

// Styles
export const STYLES = {
  MODERN: 'modern',
  TRADITIONAL: 'traditional',
  BOHEMIAN: 'bohemian',
  MINIMALIST: 'minimalist',
  LUXURY: 'luxury',
  RUSTIC: 'rustic',
  VINTAGE: 'vintage',
  CONTEMPORARY: 'contemporary'
} as const;

export type PlannerServiceLevel = typeof SERVICE_LEVELS[keyof typeof SERVICE_LEVELS];
export type PlannerSpecialty = typeof SPECIALTIES[keyof typeof SPECIALTIES];
export type PlannerStyle = typeof STYLES[keyof typeof STYLES];

export interface PriceRange {
  min: number;
  max: number;
  currency: string;
}

export interface Location {
  city: string;
  state: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  serviceRadius: number; // in kilometers
}

export interface Portfolio {
  images: string[];
  videos?: string[];
  testimonials: {
    text: string;
    author: string;
    date: string;
    rating: number;
  }[];
}

export interface WeddingPlanner {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  website?: string;
  bio: string;
  yearsOfExperience: number;
  specialties: PlannerSpecialty[];
  styles: PlannerStyle[];
  priceRange: PriceRange;
  languages: string[];
  location: Location;
  portfolio: Portfolio;
  rating: number;
  totalReviews: number;
  verified: boolean;
  featured: boolean;
  availability: {
    nextAvailable: string;
    fullyBookedUntil?: string;
  };
  metrics: {
    responseRate: number;
    responseTime: number; // in hours
    completedWeddings: number;
    leadConversionRate: number;
  };
  createdAt: string;
  updatedAt: string;
  passwordHash: string;
  apiKey?: string;
  subscriptionStatus: 'free' | 'premium' | 'enterprise';
  subscriptionEndDate?: string;
}

export interface LeadScore {
  engagement: number; // 0-100
  budget: number; // 0-100
  timeframe: number; // 0-100
  completeness: number; // 0-100
  total: number; // weighted average
}

export interface PlannerLead {
  id: string;
  weddingId: string;
  coupleName: string;
  email: string;
  phone: string;
  weddingDate: string;
  estimatedBudget?: number;
  guestCount: number;
  location: {
    city: string;
    state: string;
    country: string;
  };
  preferences?: {
    style?: PlannerStyle[];
    specialties?: PlannerSpecialty[];
    mustHaves?: string[];
  };
  score?: LeadScore;
  status: 'new' | 'contacted' | 'meeting_scheduled' | 'hired' | 'declined';
  notes?: string;
  matchedPlanners?: {
    plannerId: string;
    matchScore: number;
    status: 'pending' | 'viewed' | 'contacted' | 'meeting' | 'hired' | 'passed';
    contactedAt?: string;
  }[];
  createdAt: string;
  updatedAt: string;
  assignedAt: string;
  plannerId: string;
  alternatePlanners: string[];
}