import { createClient } from '@supabase/supabase-js';

// Shared TMT Group Supabase Workspace (Fallback defaults so it works even if Railway build-time args are missed)
const DEFAULT_SUPABASE_URL = 'https://lwrtwpnlhjffznrjrysg.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3cnR3cG5saGpmZnpucmpyeXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1MzMyOTQsImV4cCI6MjEwNzEwOTI5NH0.IZhngB1gucuhWFlRQurRwPO3JIdr7DnKSDvNMVyQidM';

const getEnvUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (envUrl && envUrl !== 'https://placeholder.supabase.co' && !envUrl.includes('hdmyophnkfqasjaotfiz')) {
    return envUrl;
  }
  return DEFAULT_SUPABASE_URL;
};

const getEnvKey = () => {
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (envKey && envKey !== 'placeholder-anon-key' && (!envUrl || !envUrl.includes('hdmyophnkfqasjaotfiz'))) {
    return envKey;
  }
  return DEFAULT_SUPABASE_ANON_KEY;
};

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
export const supabase = createClient(getEnvUrl(), getEnvKey());
