import { useEffect, useState } from "react";
import { getDepartments } from "../services/departmentService";

export function useDepartments() {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    async function load() {
      const { data } = await getDepartments();

      if (data) {
        setDepartments(data);
      }
    }

    load();
  }, []);

  return departments;
}