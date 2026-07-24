import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fgosxvsscylcbahhhdar.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_WsSH-uLNrBDJsNsCHlkgtQ_G7bN8wIj';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Temporarily expose supabase to window for testing RLS from browser console
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.supabase = supabase;
}
