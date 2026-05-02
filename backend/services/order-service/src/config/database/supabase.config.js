import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Create Supabase client with service role key for admin operations
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Create regular Supabase client for non-admin operations
export const supabaseUsers = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);