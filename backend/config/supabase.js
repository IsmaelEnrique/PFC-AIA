import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_KEY;

// Verificación simple para evitar que el servidor explote sin aviso
if (!url || !key) {
    console.error("❌ Error CRÍTICO: No se encontraron las credenciales de Supabase en el .env");
}

export const supabase = createClient(url, key);