import { useAuth } from "../../hooks/useAuth";
import PrimaryButton from "../ui/PrimaryButton";

export default function Topbar() {
  const { profile, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950 px-8 flex items-center justify-between">

      <div>
        <p className="text-sm text-slate-400">
          Welcome back
        </p>

        <h2 className="text-lg font-semibold text-white">
          {profile?.full_name}
        </h2>
      </div>

      <PrimaryButton
    onClick={logout}
    className="bg-red-600 hover:bg-red-700"
>
    Logout
        </PrimaryButton>

    </header>
  );
}