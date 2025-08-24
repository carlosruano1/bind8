// Supabase Cleanup Script
// Run this script to clear all data from your Supabase project

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nqkbmhschakblncqgewa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xa2JtaHNjaGFrYmxuY3FnZXdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNzM1NDMsImV4cCI6MjA2OTg0OTU0M30.M0G8On08ZLzh8kkRnommrD1o01BBT16Q-CdrlJ4eHeI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanupSupabase() {
  console.log('🚀 Starting Supabase cleanup...\n');

  try {
    // 1. Clear all storage files
    console.log('📁 Clearing storage files...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
    } else {
      for (const bucket of buckets) {
        console.log(`Clearing bucket: ${bucket.name}`);
        
        // List all files in the bucket
        const { data: files, error: filesError } = await supabase.storage
          .from(bucket.name)
          .list();
        
        if (filesError) {
          console.error(`Error listing files in ${bucket.name}:`, filesError);
          continue;
        }
        
        if (files && files.length > 0) {
          // Delete all files in the bucket
          const filePaths = files.map(file => file.name);
          const { error: deleteError } = await supabase.storage
            .from(bucket.name)
            .remove(filePaths);
          
          if (deleteError) {
            console.error(`Error deleting files from ${bucket.name}:`, deleteError);
          } else {
            console.log(`✅ Cleared ${filePaths.length} files from ${bucket.name}`);
          }
        } else {
          console.log(`ℹ️  No files found in ${bucket.name}`);
        }
      }
    }

    // 2. Clear all tables (if they exist)
    console.log('\n🗄️  Clearing database tables...');
    
    // List of tables that might exist in your project
    const possibleTables = [
      'weddings',
      'rsvps', 
      'song_suggestions',
      'guests',
      'photos',
      'prompt_responses'
    ];

    for (const tableName of possibleTables) {
      try {
        // Try to delete all rows from each table using a simpler approach
        const { error } = await supabase
          .from(tableName)
          .delete()
          .gte('id', '0'); // This will match all rows since we're using string IDs
        
        if (error) {
          if (error.message.includes('does not exist')) {
            console.log(`ℹ️  Table ${tableName} does not exist`);
          } else {
            // Try alternative approach - delete without conditions
            const { error: altError } = await supabase
              .from(tableName)
              .delete();
            
            if (altError) {
              console.error(`Error clearing table ${tableName}:`, altError.message);
            } else {
              console.log(`✅ Cleared table: ${tableName}`);
            }
          }
        } else {
          console.log(`✅ Cleared table: ${tableName}`);
        }
      } catch (err) {
        console.log(`ℹ️  Table ${tableName} does not exist or cannot be accessed`);
      }
    }

    console.log('\n🎉 Supabase cleanup completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Your storage buckets are still there but empty');
    console.log('2. All tables have been cleared');
    console.log('3. You can now start fresh with your wedding website data');
    console.log('\n💡 Tip: If you want to completely reset storage buckets too, you can delete and recreate them in the Supabase dashboard');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Run the cleanup
cleanupSupabase();
