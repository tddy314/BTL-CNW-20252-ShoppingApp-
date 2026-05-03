import { supabaseAdmin } from '../lib/supabase';

export const createShop = async (userId: string, name: string, description: string) => {
  const { data: existing } = await supabaseAdmin
    .from('shops')
    .select('*')
    .eq('owner_id', userId)
    .single();

  if (existing) {
    throw new Error('User already has a shop');
  }

  const { data, error } = await supabaseAdmin
    .from('shops')
    .insert({
      owner_id: userId,
      name,
      description,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
};