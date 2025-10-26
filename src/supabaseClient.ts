import { createClient } from '@supabase/supabase-js';

// This will work in both Vite (browser) and Node.js environments.
const supabaseUrl = (import.meta.env && import.meta.env.VITE_SUPABASE_URL) || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anonymous key are required. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file and that the seed script is loading them correctly.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
