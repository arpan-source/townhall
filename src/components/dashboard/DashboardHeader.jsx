import { useAuth } from "../../hooks/useAuth";

export default function DashboardHeader() {
  const { profile } = useAuth();

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-white">
        Welcome, {profile?.full_name}
      </h1>

      <p className="text-slate-400 mt-2">
        Let's make today productive.
      </p>
    </div>
  );
}