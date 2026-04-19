import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Validate env (đỡ debug kiểu cầu nguyện)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL) throw new Error('Missing SUPABASE_URL');
if (!SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
if (!ANON_KEY) throw new Error('Missing SUPABASE_ANON_KEY');

// Admin client (full quyền, đừng dại expose ra client)
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// User client (dùng cho request bình thường)
export const supabaseUsers = createClient(
  SUPABASE_URL,
  ANON_KEY,
  {
    auth: {
      persistSession: false, // backend thì không cần giữ session
    },
  }
);

// Optional helper cho pattern sạch sẽ hơn
export const db = {
  from: (table) => supabaseUsers.from(table),
};

export const adminDb = {
  from: (table) => supabaseAdmin.from(table),
};