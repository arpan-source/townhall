import { Routes, Route } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import PendingApproval from "../pages/auth/PendingApproval";
import UserManagement from "../pages/executive/UserManagement";

import RoleRouter from "./RoleRouter";
import ProtectedRoute from "./ProtectedRoute";

import ExecutiveDashboard from "../pages/executive/ExecutiveDashboard";
import Reports from "../pages/executive/Reports";

export function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      <Route path="/signup" element={<SignupPage />} />

      {/* Authenticated but pending */}
      <Route path="/pending-approval" element={<PendingApproval />} />

      <Route
        path="/executive/users"
        element={
          <ProtectedRoute allowedRoles={["CEO"]}>
            <UserManagement />
          </ProtectedRoute>
        }
      />

      {/* Role-based entry point */}
      <Route path="/dashboard" element={<RoleRouter />} />

      {/* CEO */}
      <Route
        path="/executive"
        element={
          <ProtectedRoute allowedRoles={["CEO"]}>
            <ExecutiveDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/executive/reports"
        element={
          <ProtectedRoute allowedRoles={["CEO"]}>
            <Reports />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<RoleRouter />} />
    </Routes>
  );
}
