import { useEffect, useState } from "react";
import {
  getInitiatives,
  createInitiative,
  updateInitiative,
  deleteInitiative,
} from "../services/initiativeService";

export function useInitiatives() {
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadInitiatives() {
    setLoading(true);

    const { data, error } = await getInitiatives();

    if (error) {
      console.error(error);
    } else {
      setInitiatives(data);
    }

    setLoading(false);
  }

  async function addInitiative(values) {
    const { error } = await createInitiative(values);

    if (!error) {
      loadInitiatives();
    }

    return error;
  }

  async function editInitiative(id, values) {
    const { error } = await updateInitiative(id, values);

    if (!error) {
      loadInitiatives();
    }

    return error;
  }

  async function removeInitiative(id) {
    const { error } = await deleteInitiative(id);

    if (!error) {
      loadInitiatives();
    }

    return error;
  }

  useEffect(() => {
    loadInitiatives();
  }, []);

  return {
    initiatives,
    loading,
    addInitiative,
    editInitiative,
    removeInitiative,
    refresh: loadInitiatives,
  };
}