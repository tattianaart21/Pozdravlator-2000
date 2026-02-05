/**
 * Синхронизация контактов и сохранённых поздравлений с Supabase.
 * При входе данные подгружаются с сервера и отображаются на всех устройствах.
 */
import { supabase } from './supabase';

export async function loadContactsFromSupabase(userId) {
  if (!supabase || !userId) return null;
  try {
    const { data, error } = await supabase
      .from('pozdrav_contacts')
      .select('data')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) return null;
    return (data || []).map((row) => row.data).filter(Boolean);
  } catch {
    return null;
  }
}

export async function saveContactsToSupabase(userId, contacts) {
  if (!supabase || !userId || !Array.isArray(contacts)) return false;
  try {
    await supabase.from('pozdrav_contacts').delete().eq('user_id', userId);
    if (contacts.length === 0) return true;
    const rows = contacts.map((c) => ({ user_id: userId, data: c }));
    const { error } = await supabase.from('pozdrav_contacts').insert(rows);
    return !error;
  } catch {
    return false;
  }
}

export async function loadCongratulationsFromSupabase(userId) {
  if (!supabase || !userId) return null;
  try {
    const { data, error } = await supabase
      .from('pozdrav_congratulations')
      .select('data')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) return null;
    return (data || []).map((row) => row.data).filter(Boolean);
  } catch {
    return null;
  }
}

export async function saveCongratulationsToSupabase(userId, items) {
  if (!supabase || !userId || !Array.isArray(items)) return false;
  try {
    await supabase.from('pozdrav_congratulations').delete().eq('user_id', userId);
    if (items.length === 0) return true;
    const rows = items.map((c) => ({ user_id: userId, data: c }));
    const { error } = await supabase.from('pozdrav_congratulations').insert(rows);
    return !error;
  } catch {
    return false;
  }
}
