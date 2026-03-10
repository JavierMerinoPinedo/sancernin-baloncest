// ─── Cliente Supabase ────────────────────────────────────────────────────────
// Renombra este fichero a .env.local y rellena con tus credenciales de:
// https://supabase.com/dashboard/project/<tu-proyecto>/settings/api
//
//   VITE_SUPABASE_URL=https://xxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY=eyJhbGci...
//
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    '❌ Faltan variables de entorno.\n' +
    'Crea un fichero .env.local con:\n' +
    '  VITE_SUPABASE_URL=https://xxxx.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=eyJhbGci...'
  );
}

export const supabase = createClient(url, key);
