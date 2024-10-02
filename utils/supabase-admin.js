import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  "https://zsopowshkykgtvauldrz.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE
);

export default supabaseAdmin;
