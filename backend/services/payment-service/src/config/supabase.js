module.exports = function getSupabase() {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
  } catch (e) {
    return null;
  }
};
