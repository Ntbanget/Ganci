import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Temporarily expose supabase to window for testing RLS from browser console
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.supabase = supabase;
}
