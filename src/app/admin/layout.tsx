import { redirect } from 'next/navigation';
import { getSupabase } from '@/lib/supabaseClient';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabase();
  if (!supabase) {
    redirect('/login');
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // Check if user has admin access
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role, permissions, is_active')
    .eq('user_id', user.id)
    .single();

  if (!adminUser || !adminUser.is_active) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} adminUser={adminUser} />
      <div className="flex">
        <AdminSidebar role={adminUser.role} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
