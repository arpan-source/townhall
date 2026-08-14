import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function PendingApproval() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-8 text-center">

        <h1 className="text-2xl font-bold text-white">
          Account Pending Approval
        </h1>

        <p className="text-slate-400 mt-4">
          Your TownHall account has been created successfully.
        </p>

        <p className="text-slate-400 mt-2">
          Your account is currently waiting for administrator approval.
        </p>

        {profile?.email && (
          <p className="text-sm text-slate-500 mt-5">
            {profile.email}
          </p>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 w-full rounded-lg bg-slate-800 hover:bg-slate-700 text-white py-3 font-medium transition"
        >
          Sign Out
        </button>

        <button
          type="button"
          onClick={() =>
            window.location.reload()
          }
          className="mt-4 text-sm text-indigo-400 hover:text-indigo-300"
        >
          Check approval status
        </button>

      </div>
    </div>
  );
}