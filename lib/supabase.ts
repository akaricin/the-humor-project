import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

let supabase: ReturnType<typeof createClient<Database>> | undefined;

export function getSupabaseClient() {
  if (!supabase) {
    supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabase;
}
