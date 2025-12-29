import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_CONFIG } from '@/config/supabase';

const supabaseUrl = SUPABASE_CONFIG.url;
const supabaseKey = SUPABASE_CONFIG.anonKey;

// Validate configuration
if (!supabaseUrl) {
  console.error('❌ Supabase URL not configured. Please set EXPO_PUBLIC_SUPABASE_URL in .env');
}

if (!supabaseKey) {
  console.error('❌ Supabase Anon Key not configured. Please set EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: SUPABASE_CONFIG.auth.autoRefreshToken,
      persistSession: SUPABASE_CONFIG.auth.persistSession,
      detectSessionInUrl: SUPABASE_CONFIG.auth.detectSessionInUrl,
    },
  }
);

// Auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('✅ Token refreshed');
  } else if (event === 'SIGNED_OUT') {
    console.log('👋 User signed out');
  } else if (event === 'SIGNED_IN') {
    console.log('👤 User signed in');
  }
});

// Helper to handle Supabase errors
export const handleSupabaseError = (error: any, operation: string) => {
  console.error(`❌ Error in ${operation}:`, error);
  return {
    success: false,
    data: null,
    error: error?.message || `Error in ${operation}`,
  };
};

// Helper to handle successful responses
export const handleSupabaseSuccess = <T>(data: T) => {
  return {
    success: true,
    data,
    error: null,
  };
};
