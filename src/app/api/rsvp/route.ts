import { NextRequest, NextResponse } from 'next/server';
import { apiRateLimit } from '@/lib/rateLimit';
import { handleError, ValidationError } from '@/lib/errorHandler';
import { getSupabase } from '@/lib/supabaseClient';

// POST /api/rsvp - Submit RSVP response
export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = apiRateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const supabase = await getSupabase();
    if (!supabase) throw new Error('Database connection failed');

    const rsvpData = await request.json();

    // Validate required fields
    if (!rsvpData.wedding_id || !rsvpData.guest_name || !rsvpData.status) {
      throw new ValidationError('Missing required fields: wedding_id, guest_name, and status');
    }

    // Validate status enum
    const validStatuses = ['attending', 'not_attending', 'maybe'];
    if (!validStatuses.includes(rsvpData.status)) {
      throw new ValidationError('Invalid status. Must be one of: attending, not_attending, maybe');
    }

    // Check if wedding exists
    const { data: wedding, error: weddingError } = await supabase
      .from('weddings')
      .select('id, title')
      .eq('id', rsvpData.wedding_id)
      .single();

    if (weddingError || !wedding) {
      throw new ValidationError('Invalid wedding ID');
    }

    // Check if RSVP already exists for this guest
    const { data: existingRsvp } = await supabase
      .from('rsvps')
      .select('id')
      .eq('wedding_id', rsvpData.wedding_id)
      .eq('guest_email', rsvpData.guest_email)
      .single();

    let rsvp;
    if (existingRsvp) {
      // Update existing RSVP
      const { data: updatedRsvp, error: updateError } = await supabase
        .from('rsvps')
        .update({
          guest_name: rsvpData.guest_name,
          guest_phone: rsvpData.guest_phone,
          plus_one_name: rsvpData.plus_one_name,
          plus_one_email: rsvpData.plus_one_email,
          status: rsvpData.status,
          dietary_restrictions: rsvpData.dietary_restrictions,
          song_requests: rsvpData.song_requests,
          notes: rsvpData.notes
        })
        .eq('id', existingRsvp.id)
        .select()
        .single();

      if (updateError) throw updateError;
      rsvp = updatedRsvp;
    } else {
      // Create new RSVP
      const { data: newRsvp, error: insertError } = await supabase
        .from('rsvps')
        .insert({
          wedding_id: rsvpData.wedding_id,
          guest_name: rsvpData.guest_name,
          guest_email: rsvpData.guest_email,
          guest_phone: rsvpData.guest_phone,
          plus_one_name: rsvpData.plus_one_name,
          plus_one_email: rsvpData.plus_one_email,
          status: rsvpData.status,
          dietary_restrictions: rsvpData.dietary_restrictions,
          song_requests: rsvpData.song_requests,
          notes: rsvpData.notes
        })
        .select()
        .single();

      if (insertError) throw insertError;
      rsvp = newRsvp;
    }

    // Log RSVP submission
    await supabase
      .from('analytics')
      .insert({
        event_type: 'rsvp_submitted',
        event_data: { 
          weddingId: rsvpData.wedding_id, 
          guestName: rsvpData.guest_name,
          status: rsvpData.status 
        },
        page_url: request.url
      });

    return NextResponse.json({ 
      rsvp,
      message: 'RSVP submitted successfully'
    }, { status: 200 });

  } catch (error) {
    return handleError(error);
  }
}

// GET /api/rsvp?wedding_id=xxx - Get RSVPs for a wedding
export async function GET(request: NextRequest) {
  try {
    const rateLimitResult = apiRateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const { searchParams } = new URL(request.url);
    const weddingId = searchParams.get('wedding_id');

    if (!weddingId) {
      throw new ValidationError('Missing wedding_id parameter');
    }

    const supabase = await getSupabase();
    if (!supabase) throw new Error('Database connection failed');

    // Get RSVPs for the wedding
    const { data: rsvps, error } = await supabase
      .from('rsvps')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Count RSVPs by status
    const counts = {
      total: rsvps?.length || 0,
      attending: rsvps?.filter(r => r.status === 'attending').length || 0,
      not_attending: rsvps?.filter(r => r.status === 'not_attending').length || 0,
      maybe: rsvps?.filter(r => r.status === 'maybe').length || 0,
      pending: rsvps?.filter(r => r.status === 'pending').length || 0
    };

    return NextResponse.json({ 
      rsvps: rsvps || [],
      counts
    });

  } catch (error) {
    return handleError(error);
  }
}
