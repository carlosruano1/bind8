import { NextRequest, NextResponse } from 'next/server';
import { apiRateLimit } from '@/lib/rateLimit';
import { handleError, ValidationError, AuthenticationError, AuthorizationError } from '@/lib/errorHandler';
import { getSupabase } from '@/lib/supabaseClient';

// GET /api/admin/users - Get users with filtering and pagination
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

    if (!adminUser || !['super_admin', 'admin'].includes(adminUser.role)) {
      throw new AuthorizationError('Admin access required');
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    // Build query for auth users
    let query = supabase
      .from('auth_users')
      .select(`
        id,
        email,
        raw_user_meta_data,
        created_at,
        last_sign_in_at,
        email_confirmed_at,
        phone_confirmed_at,
        confirmed_at,
        invited_at,
        confirmation_sent_at,
        recovery_sent_at,
        email_change_sent_at,
        phone_change_sent_at,
        reauthentication_sent_at,
        banned_until,
        reauthentication_sent_at,
        aud,
        role
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`email.ilike.%${search}%,raw_user_meta_data->>'full_name'.ilike.%${search}%`);
    }
    if (role) query = query.eq('role', role);
    if (status === 'confirmed') query = query.not('confirmed_at', 'is', null);
    if (status === 'unconfirmed') query = query.is('confirmed_at', null);

    // Get total count
    const { count } = await query.count();

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: users, error } = await query;

    if (error) throw error;

    // Get additional user data from our tables
    const userIds = users?.map(u => u.id) || [];
    
    const [couples, weddings, payments] = await Promise.all([
      supabase.from('couples').select('user_id, partner1_name, partner2_name, wedding_date').in('user_id', userIds),
      supabase.from('weddings').select('couple_id, title, status, guest_count').in('couple_id', 
        couples?.data?.map(c => c.id) || []
      ),
      supabase.from('payments').select('user_id, amount, status, created_at').in('user_id', userIds)
    ]);

    // Enrich user data
    const enrichedUsers = users?.map(user => {
      const userCouples = couples?.data?.filter(c => c.user_id === user.id) || [];
      const userWeddings = weddings?.data?.filter(w => 
        userCouples.some(c => c.id === w.couple_id)
      ) || [];
      const userPayments = payments?.data?.filter(p => p.user_id === user.id) || [];

      return {
        ...user,
        profile: userCouples[0] || null,
        weddings: userWeddings,
        payments: userPayments,
        total_spent: userPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
        wedding_count: userWeddings.length
      };
    });

    return NextResponse.json({
      users: enrichedUsers || [],
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

// POST /api/admin/users - Create or update user account
export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = apiRateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const supabase = await getSupabase();
    if (!supabase) throw new Error('Database connection failed');

    // Verify super admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new AuthenticationError();

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id, role, permissions')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!adminUser || adminUser.role !== 'super_admin') {
      throw new AuthorizationError('Super admin access required');
    }

    const userData = await request.json();

    // Validate required fields
    if (!userData.email || !userData.password) {
      throw new ValidationError('Missing required fields: email and password');
    }

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(userData.email);

    let result;
    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase.auth.admin.updateUserById(existingUser.user.id, {
        email: userData.email,
        password: userData.password,
        user_metadata: {
          ...existingUser.user.user_metadata,
          ...userData.metadata,
          updated_by: adminUser.id,
          updated_at: new Date().toISOString()
        }
      });

      if (error) throw error;
      result = data;
    } else {
      // Create new user
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          ...userData.metadata,
          created_by: adminUser.id,
          created_at: new Date().toISOString()
        }
      });

      if (error) throw error;
      result = data;
    }

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        admin_user_id: adminUser.id,
        action_type: existingUser ? 'user_updated' : 'user_created',
        target_type: 'user',
        target_id: result.user.id,
        details: { 
          email: userData.email,
          action: existingUser ? 'updated' : 'created'
        },
        ip_address: request.headers.get('x-forwarded-for') || 'unknown'
      });

    return NextResponse.json({
      user: result.user,
      message: `User ${existingUser ? 'updated' : 'created'} successfully`
    });

  } catch (error) {
    return handleError(error);
  }
}
