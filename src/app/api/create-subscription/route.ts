import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { apiRateLimit } from '@/lib/rateLimit';
import { handleError, ValidationError, AuthenticationError } from '@/lib/errorHandler';
import { getSupabase } from '@/lib/supabaseClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = apiRateLimit(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    const { plannerId, priceId } = await request.json();

    // Validate required fields
    if (!plannerId || !priceId) {
      throw new ValidationError('Missing required fields: plannerId and priceId');
    }

    // Verify planner exists and user is authenticated
    const supabase = await getSupabase();
    if (!supabase) {
      throw new Error('Database connection failed');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new AuthenticationError('Authentication required');
    }

    // Verify planner profile exists
    const { data: planner, error: plannerError } = await supabase
      .from('planner_profiles')
      .select('id, user_id')
      .eq('id', plannerId)
      .single();

    if (plannerError || !planner) {
      throw new ValidationError('Invalid planner ID');
    }

    // Verify user owns this planner profile
    if (planner.user_id !== user.id) {
      throw new ValidationError('Unauthorized access to planner profile');
    }

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/planner/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/planner/signup`,
      client_reference_id: plannerId,
      subscription_data: {
        trial_period_days: 90, // 3 months free trial
        metadata: {
          plannerId,
        },
      },
    });

    // Log successful subscription creation
    await supabase
      .from('analytics')
      .insert({
        user_id: user.id,
        event_type: 'subscription_created',
        event_data: { plannerId, priceId, sessionId: session.id },
        page_url: request.url
      });

    return NextResponse.json({ 
      sessionId: session.id,
      message: 'Subscription session created successfully'
    });

  } catch (error) {
    return handleError(error);
  }
}
