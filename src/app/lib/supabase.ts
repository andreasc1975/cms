import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fails loudly at startup rather than silently falling back to
  // localStorage — better to notice a missing .env than to wonder later why
  // data isn't showing up for other visitors.
  throw new Error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in ' +
    'the values from your Supabase project (Settings → API), or set them in Vercel\'s ' +
    'Environment Variables for production.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);