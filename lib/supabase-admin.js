import { createClient } from "@supabase/supabase-js";

// SERVER-ONLY. Uses the service_role key, which bypasses RLS.
// Never import this into a client component. It only runs in API routes.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
