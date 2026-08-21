import { createClient } from '@supabase/supabase-js';

const getEnvUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const getEnvKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  const url = getEnvUrl();
  const key = getEnvKey();
  return (
    !!url &&
    url !== 'https://placeholder.supabase.co' &&
    !!key &&
    key !== 'placeholder-anon-key'
  );
};

// Create client instance dynamically
const supabaseUrl = getEnvUrl() || 'https://placeholder.supabase.co';
const supabaseAnonKey = getEnvKey() || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
