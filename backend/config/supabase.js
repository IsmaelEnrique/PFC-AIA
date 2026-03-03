import { createClient } from '@supabase/supabase-js';

// Usamos las variables que cargaste en Render
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);