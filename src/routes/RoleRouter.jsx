import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import ManagerDashboard from "../pages/manager/Dashboard";

export default function RoleRouter() {
  const { loading, user, profile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (profile?.role) {
    case "CEO":
      return <Navigate to="/executive" replace />;

    case "Manager":
      return <ManagerDashboard />;

    case "Employee":
      return (
        <div className="p-10 text-white">
          Employee Dashboard Coming Soon
        </div>
      );

    default:
      return <Navigate to="/login" replace />;
  }
}