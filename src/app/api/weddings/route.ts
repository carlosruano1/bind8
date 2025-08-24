import { NextRequest, NextResponse } from 'next/server';
import { apiRateLimit } from '@/lib/rateLimit';
import { handleError, ValidationError, AuthenticationError } from '@/lib/errorHandler';
import { getSupabase } from '@/lib/supabaseClient';

// GET /api/weddings - Get user's weddings
export async function GET(request: NextRequest) {
  try {
    const rateLimitResult = apiRateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const supabase = await getSupabase();
    if (!supabase) throw new Error('Database connection failed');

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new AuthenticationError();

    // Get user's weddings
    const { data: weddings, error } = await supabase
      .from('weddings')
      .select(`
        *,
        couples!inner(user_id),
        planner_profiles(company_name, contact_name)
      `)
      .eq('couples.user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ weddings: weddings || [] });

  } catch (error) {
    return handleError(error);
  }
}

// POST /api/weddings - Create new wedding
export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = apiRateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const supabase = await getSupabase();
    if (!supabase) throw new Error('Database connection failed');

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new AuthenticationError();

    const weddingData = await request.json();

    // Validate required fields
    if (!weddingData.title || !weddingData.wedding_date) {
      throw new ValidationError('Missing required fields: title and wedding_date');
    }

    // Check if user already has a couple profile, create if not
    let { data: couple } = await supabase
      .from('couples')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!couple) {
      // Create couple profile if it doesn't exist
      const { data: newCouple, error: coupleError } = await supabase
        .from('couples')
        .insert({
          user_id: user.id,
          partner1_name: weddingData.partner1_name || 'Partner 1',
          partner2_name: weddingData.partner2_name || 'Partner 2',
          email: user.email || '',
          wedding_date: weddingData.wedding_date
        })
        .select()
        .single();

      if (coupleError) throw coupleError;
      couple = newCouple;
    }

    // Create wedding
    const { data: wedding, error: weddingError } = await supabase
      .from('weddings')
      .insert({
        couple_id: couple.id,
        title: weddingData.title,
        description: weddingData.description,
        venue_name: weddingData.venue_name,
        venue_address: weddingData.venue_address,
        wedding_date: weddingData.wedding_date,
        ceremony_time: weddingData.ceremony_time,
        reception_time: weddingData.reception_time,
        guest_count: weddingData.guest_count || 0,
        budget: weddingData.budget,
        theme: weddingData.theme,
        colors: weddingData.colors
      })
      .select()
      .single();

    if (weddingError) throw weddingError;

    // Log wedding creation
    await supabase
      .from('analytics')
      .insert({
        user_id: user.id,
        event_type: 'wedding_created',
        event_data: { weddingId: wedding.id, title: wedding.title },
        page_url: request.url
      });

    return NextResponse.json({ 
      wedding,
      message: 'Wedding created successfully'
    }, { status: 201 });

  } catch (error) {
    return handleError(error);
  }
}
