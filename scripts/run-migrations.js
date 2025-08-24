#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
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

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...\n');

    // Get all migration files
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure they run in order

    console.log(`Found ${migrationFiles.length} migration files:`);
    migrationFiles.forEach(file => console.log(`  - ${file}`));
    console.log('');

    // Track which migrations have been run
    const { data: appliedMigrations } = await supabase
      .from('schema_migrations')
      .select('version')
      .catch(() => ({ data: [] }));

    const appliedVersions = new Set(appliedMigrations?.map(m => m.version) || []);

    for (const file of migrationFiles) {
      const version = file.replace('.sql', '');
      
      if (appliedVersions.has(version)) {
        console.log(`⏭️  Skipping ${file} (already applied)`);
        continue;
      }

      console.log(`📝 Running ${file}...`);
      
      const migrationPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(migrationPath, 'utf8');

      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await supabase.rpc('exec_sql', { sql: statement + ';' });
          } catch (error) {
            // Try direct query if RPC fails
            await supabase.rpc('exec_sql', { sql: statement + ';' });
          }
        }
      }

      // Mark migration as applied
      try {
        await supabase
          .from('schema_migrations')
          .insert({ version, applied_at: new Date().toISOString() });
      } catch (error) {
        // Create table if it doesn't exist
        await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS schema_migrations (
              version TEXT PRIMARY KEY,
              applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `
        });
        
        await supabase
          .from('schema_migrations')
          .insert({ version, applied_at: new Date().toISOString() });
      }

      console.log(`✅ Completed ${file}`);
    }

    console.log('\n🎉 All migrations completed successfully!');
    
    // Show current schema version
    const { data: latestMigration } = await supabase
      .from('schema_migrations')
      .select('version, applied_at')
      .order('applied_at', { ascending: false })
      .limit(1);

    if (latestMigration?.[0]) {
      console.log(`\n📊 Current schema version: ${latestMigration[0].version}`);
      console.log(`   Applied: ${latestMigration[0].applied_at}`);
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
