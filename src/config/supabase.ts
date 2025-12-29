// Supabase Configuration for Vinylia

export const SUPABASE_CONFIG = {
  // Get these from: https://supabase.com/dashboard > Settings > API
  url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',

  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
};
