import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import ManagerDashboard from "../pages/manager/Dashboard";
import ExecutiveDashboard from "../pages/executive/ExecutiveDashboard";

export default function RoleRouter() {
  const {
    loading,
    user,
    profile,
  } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Unable to load your profile.
      </div>
    );
  }

  // Account exists but has not been approved.
  if (profile.is_active === false) {
    return (
      <Navigate
        to="/pending-approval"
        replace
      />
    );
  }

  switch (profile.role) {
    case "CEO":
      return <ExecutiveDashboard />;

    case "Manager":
      return <ManagerDashboard />;

    case "Employee":
      return (
        <div className="p-10 text-white">
          Employee Dashboard Coming Soon
        </div>
      );

    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
          Invalid account role.
        </div>
      );
  }
}