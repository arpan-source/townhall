import { supabase } from "../lib/supabase";

export async function createWeeklyUpdate(values) {
  return await supabase
    .from("initiative_updates")
    .insert(values);
}

export async function getWeeklyUpdates(initiativeId) {
  return await supabase
    .from("initiative_updates")
    .select(`
      *,
      profiles!initiative_updates_user_id_fkey (
        id,
        full_name
      )
    `)
    .eq("initiative_id", initiativeId)
    .order("created_at", {
      ascending: false,
    });
}