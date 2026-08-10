import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function useAuth() {
  console.log("useAuth Hook Rendered");
  return useContext(AuthContext);
}