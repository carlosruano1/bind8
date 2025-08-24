// Modern approach using dynamic imports to avoid SSR issues
import type { SupabaseClient, User } from '@supabase/supabase-js';

let supabaseInstance: any = null;

const getSupabaseClient = async () => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!supabaseInstance) {
    try {
      // Dynamic import to avoid SSR issues
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = 'https://nqkbmhschakblncqgewa.supabase.co';
      const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xa2JtaHNjaGFrYmxuY3FnZXdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNzM1NDMsImV4cCI6MjA2OTg0OTU0M30.M0G8On08ZLzh8kkRnommrD1o01BBT16Q-CdrlJ4eHeI';
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      return null;
    }
  }
  
  return supabaseInstance;
};

// Export a function that returns the client
export const getSupabase = async () => await getSupabaseClient();

// Authentication utility functions
export const signUp = async (email: string, password: string) => {
  const supabase = await getSupabaseClient();
  if (!supabase) return { error: { message: 'Supabase client not available' } };
  
  return await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        role: 'couple'
      }
    }
  });
};

// Planner-specific authentication
export const signUpPlanner = async (
  email: string,
  password: string,
  profile: {
    company_name: string;
    contact_name: string;
    phone: string;
    service_level: string;
    specialties: string[];
    city: string;
    state: string;
    country: string;
  }
) => {
  const supabase = await getSupabaseClient();
  if (!supabase) return { error: { message: 'Supabase client not available' } };
  
  // First create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        role: 'planner',
        company: profile.company_name
      }
    }
  });
  
  if (authError) return { error: authError };
  
  // Then create their profile
  const { data: profileData, error: profileError } = await supabase
    .from('planner_profiles')
    .insert({
      user_id: authData.user?.id,
      ...profile,
      email
    })
    .select()
    .single();
  
  if (profileError) {
    // If profile creation fails, we should probably delete the auth user
    await supabase.auth.admin.deleteUser(authData.user?.id as string);
    return { error: profileError };
  }
  
  return { data: { auth: authData, profile: profileData }, error: null };
};

export const signIn = async (email: string, password: string) => {
  const supabase = await getSupabaseClient();
  if (!supabase) return { error: { message: 'Supabase client not available' } };
  
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  const supabase = await getSupabaseClient();
  if (!supabase) return { error: { message: 'Supabase client not available' } };
  
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  const supabase = await getSupabaseClient();
  if (!supabase) return { data: { user: null }, error: { message: 'Supabase client not available' } };
  
  return await supabase.auth.getUser();
};

export const getSession = async () => {
  const supabase = await getSupabaseClient();
  if (!supabase) return { data: { session: null }, error: { message: 'Supabase client not available' } };
  
  return await supabase.auth.getSession();
};

// Database operations for wedding data
export const saveWedding = async (weddingData: any) => {
  const supabase = await getSupabaseClient();
  if (!supabase) return { error: { message: 'Supabase client not available' } };
  
  // Store in 'weddings' table
  return await supabase
    .from('weddings')
    .upsert(weddingData)
    .select();
};

export const getWedding = async (weddingId: string) => {
  const supabase = await getSupabaseClient();
  if (!supabase) return { error: { message: 'Supabase client not available' } };
  
  return await supabase
    .from('weddings')
    .select('*')
    .eq('id', weddingId)
    .single();
};

export const getWeddingsByUser = async (userId: string) => {
  const supabase = await getSupabaseClient();
  if (!supabase) return { error: { message: 'Supabase client not available' } };
  
  return await supabase
    .from('weddings')
    .select('*')
    .eq('user_id', userId);
};

// Storage utility functions
export const uploadImage = async (file: File, weddingId: string, imageType: string): Promise<string> => {
  const supabase = await getSupabaseClient();
  
  if (!supabase) {
    throw new Error('Supabase client not available. Please ensure you are running this on the client side.');
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${weddingId}/${imageType}-${Date.now()}.${fileExt}`;
    
    console.log('Attempting to upload:', fileName);
    
    const { data, error } = await supabase.storage
      .from('wedding-images')
      .upload(fileName, file);
      
    if (error) {
      console.error('Upload error:', error);
      if (error.message.includes('bucket') || error.message.includes('not found')) {
        throw new Error('Storage bucket not found. Please ensure the "wedding-images" bucket is created in your Supabase dashboard.');
      }
      if (error.message.includes('row-level security') || error.message.includes('RLS')) {
        throw new Error('Storage bucket policies not configured. Please check your Supabase storage policies.');
      }
      throw new Error(`Upload failed: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('Upload failed: No data returned');
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('wedding-images')
      .getPublicUrl(fileName);
      
    if (!publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }
    
    console.log('Upload successful:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const uploadMultipleImages = async (files: File[], weddingId: string): Promise<string[]> => {
  const supabase = await getSupabaseClient();
  
  if (!supabase) {
    throw new Error('Supabase client not available. Please ensure you are running this on the client side.');
  }

  try {
    const uploadPromises = files.map((file, index) => 
      uploadImage(file, weddingId, `gallery-${index}`)
    );
    
    return Promise.all(uploadPromises);
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw error;
  }
};
