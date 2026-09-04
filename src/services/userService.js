import { supabase } from "../lib/supabase";

export async function getPendingUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      role,
      department_id,
      is_active,
      created_at
    `)
    .eq("is_active", false)
    .order("created_at", {
      ascending: false,
    });

  return {
    data,
    error,
  };
}

export async function approveUser(
  userId,
  role,
  departmentId = null,
  campaignRole = null,
) {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      role,
      department_id: departmentId,
      campaign_role: campaignRole,
      is_active: true,
    })
    .eq("id", userId)
    .select()
    .single();

  return { data, error };
}

export async function getDepartments() {
  const { data, error } = await supabase
    .from("departments")
    .select("id, name")
    .order("name", {
      ascending: true,
    });

  return {
    data,
    error,
  };
}

export async function deactivateUser(
  userId,
) {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      is_active: false,
    })
    .eq("id", userId)
    .select()
    .single();

  return {
    data,
    error,
  };
}