#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAdmin() {
  try {
    console.log('🚀 Setting up Bind8 Admin System...\n');

    // Check if admin system is already set up
    const { data: existingAdmins } = await supabase
      .from('admin_users')
      .select('*')
      .limit(1);

    if (existingAdmins && existingAdmins.length > 0) {
      console.log('⚠️  Admin system already exists. Skipping setup.');
      return;
    }

    // Step 1: Create admin user
    console.log('📝 Step 1: Creating admin user...');
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@bind8.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    
    if (!adminEmail || !adminPassword) {
      console.error('❌ Please set ADMIN_EMAIL and ADMIN_PASSWORD environment variables');
      process.exit(1);
    }

    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        role: 'super_admin',
        created_by: 'system_setup',
        created_at: new Date().toISOString()
      }
    });

    if (authError) {
      console.error('❌ Failed to create admin user:', authError.message);
      process.exit(1);
    }

    console.log(`✅ Admin user created: ${adminEmail}`);

    // Step 2: Create admin profile
    console.log('📝 Step 2: Creating admin profile...');
    
    const { data: adminProfile, error: profileError } = await supabase
      .from('admin_users')
      .insert({
        user_id: authUser.user.id,
        role: 'super_admin',
        department: 'Management',
        permissions: { all: true },
        is_active: true
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Failed to create admin profile:', profileError.message);
      process.exit(1);
    }

    console.log('✅ Admin profile created');

    // Step 3: Insert sample system metrics
    console.log('📝 Step 3: Setting up system metrics...');
    
    const sampleMetrics = [
      { metric_name: 'active_users', metric_value: 0, metric_unit: 'users' },
      { metric_name: 'total_weddings', metric_value: 0, metric_unit: 'events' },
      { metric_name: 'support_tickets', metric_value: 0, metric_unit: 'tickets' },
      { metric_name: 'total_revenue', metric_value: 0, metric_unit: 'USD' },
      { metric_name: 'system_uptime', metric_value: 99.9, metric_unit: '%' }
    ];

    for (const metric of sampleMetrics) {
      await supabase
        .from('system_metrics')
        .insert({
          ...metric,
          tags: { category: 'system', source: 'setup' }
        });
    }

    console.log('✅ System metrics initialized');

    // Step 4: Create sample support ticket categories
    console.log('📝 Step 4: Setting up support system...');
    
    // This will be handled by the enum types in the migration

    console.log('✅ Support system ready');

    // Step 5: Set up initial admin actions log
    console.log('📝 Step 5: Setting up audit trail...');
    
    await supabase
      .from('admin_actions')
      .insert({
        admin_user_id: adminProfile.id,
        action_type: 'system_setup',
        target_type: 'system',
        target_id: adminProfile.id,
        details: { 
          setup_completed: true,
          timestamp: new Date().toISOString()
        },
        ip_address: 'system'
      });

    console.log('✅ Audit trail initialized');

    // Success message
    console.log('\n🎉 Admin system setup completed successfully!');
    console.log('\n📊 Admin Account Details:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role: Super Admin`);
    console.log(`   Access: Full system access`);
    
    console.log('\n🔐 Next Steps:');
    console.log('   1. Log in to /admin with the credentials above');
    console.log('   2. Change the default password immediately');
    console.log('   3. Create additional admin users as needed');
    console.log('   4. Configure system settings');
    
    console.log('\n⚠️  Security Note:');
    console.log('   Please change the default password immediately after first login!');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupAdmin();
}

module.exports = { setupAdmin };
