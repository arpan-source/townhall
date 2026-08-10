import { supabase } from "../lib/supabase";

export async function getInitiatives() {
  return await supabase
    .from("initiatives")
    .select(`
    *,
    departments!initiatives_department_id_fkey (
        id,
        name,
        code
    ),
    profiles!initiatives_owner_id_fkey (
        id,
        full_name
    )
    `)
    .order("created_at", { ascending: false });
}

export async function createInitiative(data) {
  return await supabase
    .from("initiatives")
    .insert(data)
    .select()
    .single();
}

export async function updateInitiative(id, data) {
  return await supabase
    .from("initiatives")
    .update(data)
    .eq("id", id);
}

export async function deleteInitiative(id) {
  return await supabase
    .from("initiatives")
    .delete()
    .eq("id", id);
}

export async function updateInitiativeProgress(
  id,
  progress
) {

  let status = "Not Started";

  if (progress > 0) {
    status = "In Progress";
  }

  if (progress === 100) {
    status = "Completed";
  }

  return await supabase
    .from("initiatives")
    .update({
      progress,
      status,
    })
    .eq("id", id);

}