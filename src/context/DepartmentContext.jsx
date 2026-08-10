import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const DepartmentContext = createContext();

export function DepartmentProvider({ children }) {

  console.log("✅ DepartmentProvider Mounted");

  const [departments, setDepartments] = useState([]);

  useEffect(() => {

    console.log("🚀 Loading Departments...");

    async function loadDepartments() {

      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name");

      console.log("Departments Data:", data);
      console.log("Departments Error:", error);

      if (data) {
        setDepartments(data);
      }
    }

    loadDepartments();

  }, []);

  return (
    <DepartmentContext.Provider value={{ departments }}>
      {children}
    </DepartmentContext.Provider>
  );
}

export function useDepartments() {
  return useContext(DepartmentContext);
}