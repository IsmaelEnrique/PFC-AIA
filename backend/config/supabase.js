import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.VITE_SUPABASE_KEY;

const looksLikeJwt = typeof key === 'string' && key.split('.').length === 3;
const looksLikeNewSupabaseKey =
  typeof key === 'string' && (key.startsWith('sb_publishable_') || key.startsWith('sb_secret_'));

// Verificación simple para evitar que el servidor explote sin aviso
if (!url || !key) {
    console.error("❌ Error CRÍTICO: Faltan SUPABASE_URL y/o SUPABASE_KEY en el .env");
    throw new Error('Supabase no configurado: revisar variables de entorno');
}

if (!looksLikeJwt && !looksLikeNewSupabaseKey) {
  console.error("❌ Error CRÍTICO: La API key de Supabase no es válida. Usá una `anon/service_role` (JWT) o `sb_publishable_/sb_secret_`.");
    throw new Error('Supabase key inválida');
}

export const supabase = createClient(url, key);