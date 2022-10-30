import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseToken = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabaseClient = createClient(supabaseUrl, supabaseToken);

export default supabaseClient;
