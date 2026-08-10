import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import RoleRouter from "./RoleRouter";
import ExecutiveDashboard from "../pages/executive/ExecutiveDashboard";
import ProtectedRoute from "./ProtectedRoute";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleRouter />
          </ProtectedRoute>
        }
      />{" "}
      <Route path="*" element={<RoleRouter />} />
      <Route
        path="/executive"
        element={
          <ProtectedRoute>
            <ExecutiveDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
