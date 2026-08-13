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
  const result = await supabase
    .from("initiatives")
    .delete()
    .eq("id", id);


  return result;
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

export async function getInitiativesWithLatestUpdates() {
  const { data, error } = await supabase
    .from("initiatives")
    .select(`
      *,
      initiative_updates (
        id,
        message,
        blockers,
        progress,
        created_at,
        user_id
      )
    `)
    .order("created_at", {
      referencedTable: "initiative_updates",
      ascending: false,
    });

  if (error) {
    console.error(
      "Failed to fetch initiatives with updates:",
      error
    );

    return {
      data: null,
      error,
    };
  }

  const initiativesWithLatestUpdate = data.map(
    (initiative) => {
      const updates =
        initiative.initiative_updates || [];

      return {
        ...initiative,
        latestUpdate:
          updates.length > 0
            ? updates[0]
            : null,
      };
    }
  );

  return {
    data: initiativesWithLatestUpdate,
    error: null,
  };
}