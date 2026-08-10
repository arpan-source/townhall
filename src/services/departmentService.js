import { supabase } from "../lib/supabase";

export async function getDepartments() {
  return await supabase
    .from("departments")
    .select("*")
    .order("name");
}