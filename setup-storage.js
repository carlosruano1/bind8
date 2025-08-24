// This script helps you set up Supabase storage
// Run this in your browser console on the Supabase dashboard

console.log(`
🚀 Supabase Storage Setup Instructions:

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: nqkbmhschakblncqgewa
3. Click on "Storage" in the left sidebar
4. Click "Create a new bucket"
5. Enter these details:
   - Name: wedding-images
   - Public bucket: ✅ (checked)
   - File size limit: 50MB (or your preference)
   - Allowed MIME types: image/*

6. Click "Create bucket"

7. Then go to Storage > Policies and add this policy for public access:
   - Policy name: "Public read access"
   - Target roles: public
   - Policy definition: SELECT
   - Using expression: true

8. Add another policy for authenticated uploads:
   - Policy name: "Authenticated uploads"
   - Target roles: authenticated
   - Policy definition: INSERT
   - Using expression: true

Your storage is now ready! 🎉
`);
