import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const DepartmentContext = createContext();

export function DepartmentProvider({ children }) {


  const [departments, setDepartments] = useState([]);

  useEffect(() => {


    async function loadDepartments() {

      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name");

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