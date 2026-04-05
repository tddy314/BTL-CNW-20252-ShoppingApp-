import { supabaseAdmin, supabaseUsers } from "../src/config/database/supabase.config.js";

async function testConnection() {
  const { data, error } = await supabaseUsers
    .schema('auth_service')
    .from('users')   
    .select('*')
    .limit(1)

  if (error) {
    console.error('❌ Connect failed:', error.message)
  } else {
    console.log('✅ Connected successfully!')
    console.log('Data:', data)
  }
}

testConnection()
