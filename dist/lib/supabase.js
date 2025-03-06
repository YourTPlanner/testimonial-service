"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const envLoader_1 = require("../utils/envLoader");
const supabase = (0, supabase_js_1.createClient)(envLoader_1.envLoader.SUPABASE_URL, envLoader_1.envLoader.SUPABASE_ANON, {
    db: { schema: "testimonials" },
});
exports.supabase = supabase;
