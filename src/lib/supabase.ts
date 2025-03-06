import { createClient } from "@supabase/supabase-js";
import { envLoader } from "../utils/envLoader";

const supabase = createClient(envLoader.SUPABASE_URL, envLoader.SUPABASE_ANON, {
    db: { schema: "testimonials" },
});

export { supabase };
