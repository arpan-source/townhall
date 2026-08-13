import { useEffect, useState } from "react";
import {
  getInitiatives,
  createInitiative,
  updateInitiative,
  deleteInitiative,
  getInitiativesWithLatestUpdates,
} from "../services/initiativeService";

export function useInitiatives() {
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadInitiatives() {
    setLoading(true);
    setError(null);

    const { data, error } = await getInitiativesWithLatestUpdates();

    if (error) {
      console.error("Failed to load initiatives:", error);

      setError(error);
      setInitiatives([]);
    } else {
      setInitiatives(data || []);
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

    if (error) {
      console.error("removeInitiative error:", error);

      return error;
    }

    await loadInitiatives();

    return null;
  }

  useEffect(() => {
    loadInitiatives();
  }, []);

  return {
    initiatives,
    loading,
    error,
    addInitiative,
    editInitiative,
    removeInitiative,
    refresh: loadInitiatives,
  };
}
