import { NextRequest, NextResponse } from 'next/server';
import { apiRateLimit } from '@/lib/rateLimit';
import { handleError, ValidationError, AuthenticationError, AuthorizationError } from '@/lib/errorHandler';
import { getSupabase } from '@/lib/supabaseClient';

// GET /api/admin/tickets - Get all support tickets with filtering
export async function GET(request: NextRequest) {
  try {
    const rateLimitResult = apiRateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const supabase = await getSupabase();
    if (!supabase) throw new Error('Database connection failed');

    // Verify admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new AuthenticationError();

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role, permissions')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!adminUser) throw new AuthorizationError('Admin access required');

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const assignedAgent = searchParams.get('assigned_agent');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('support_tickets')
      .select(`
        *,
        admin_users!assigned_agent_id(id, user_id, role, department),
        auth_users!user_id(email, raw_user_meta_data),
        weddings!wedding_id(title, wedding_date)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (category) query = query.eq('category', category);
    if (assignedAgent) query = query.eq('assigned_agent_id', assignedAgent);

    // Get total count for pagination
    const { count } = await query.count();

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: tickets, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      tickets: tickets || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    return handleError(error);
  }
}

// POST /api/admin/tickets - Create new support ticket
export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = apiRateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const supabase = await getSupabase();
    if (!supabase) throw new Error('Database connection failed');

    // Verify admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new AuthenticationError();

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id, role, permissions')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!adminUser) throw new AuthorizationError('Admin access required');

    const ticketData = await request.json();

    // Validate required fields
    if (!ticketData.subject || !ticketData.description || !ticketData.customer_email || !ticketData.customer_name) {
      throw new ValidationError('Missing required fields: subject, description, customer_email, customer_name');
    }

    // Generate ticket number
    const { data: ticketNumber } = await supabase.rpc('generate_ticket_number');

    // Create ticket
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({
        ticket_number: ticketNumber,
        user_id: ticketData.user_id,
        wedding_id: ticketData.wedding_id,
        assigned_agent_id: ticketData.assigned_agent_id || adminUser.id,
        category: ticketData.category || 'general_inquiry',
        priority: ticketData.priority || 'medium',
        subject: ticketData.subject,
        description: ticketData.description,
        customer_email: ticketData.customer_email,
        customer_name: ticketData.customer_name,
        customer_phone: ticketData.customer_phone,
        internal_notes: ticketData.internal_notes,
        tags: ticketData.tags || []
      })
      .select()
      .single();

    if (error) throw error;

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        admin_user_id: adminUser.id,
        action_type: 'ticket_created',
        target_type: 'support_ticket',
        target_id: ticket.id,
        details: { ticket_number: ticket.ticket_number, category: ticket.category },
        ip_address: request.headers.get('x-forwarded-for') || 'unknown'
      });

    // Log ticket activity
    await supabase
      .from('ticket_activities')
      .insert({
        ticket_id: ticket.id,
        admin_user_id: adminUser.id,
        action: 'ticket_created',
        details: { created_by: adminUser.id },
        ip_address: request.headers.get('x-forwarded-for') || 'unknown'
      });

    return NextResponse.json({
      ticket,
      message: 'Support ticket created successfully'
    }, { status: 201 });

  } catch (error) {
    return handleError(error);
  }
}
