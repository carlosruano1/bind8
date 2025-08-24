import { getSupabase } from '@/lib/supabaseClient';
import DashboardMetrics from '@/components/admin/DashboardMetrics';
import RecentTickets from '@/components/admin/RecentTickets';
import SystemHealth from '@/components/admin/SystemHealth';
import QuickActions from '@/components/admin/QuickActions';

export default async function AdminDashboard() {
  const supabase = await getSupabase();
  if (!supabase) return null;

  // Get key metrics
  const [
    { count: totalUsers },
    { count: totalWeddings },
    { count: openTickets },
    { count: totalPayments }
  ] = await Promise.all([
    supabase.from('auth_users').select('*', { count: 'exact', head: true }),
    supabase.from('weddings').select('*', { count: 'exact', head: true }),
    supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('payments').select('*', { count: 'exact', head: true })
  ]);

  // Get recent tickets
  const { data: recentTickets } = await supabase
    .from('support_tickets')
    .select(`
      *,
      admin_users!assigned_agent_id(id, user_id, role, department),
      auth_users!user_id(email, raw_user_meta_data)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get system metrics
  const { data: systemMetrics } = await supabase
    .from('system_metrics')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(10);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome to your Bind8 administration panel. Monitor system health, manage users, and handle support requests.
        </p>
      </div>

      {/* Key Metrics */}
      <DashboardMetrics
        totalUsers={totalUsers || 0}
        totalWeddings={totalWeddings || 0}
        openTickets={openTickets || 0}
        totalPayments={totalPayments || 0}
      />

      {/* Quick Actions */}
      <QuickActions />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Support Tickets */}
        <RecentTickets tickets={recentTickets || []} />

        {/* System Health */}
        <SystemHealth metrics={systemMetrics || []} />
      </div>
    </div>
  );
}
