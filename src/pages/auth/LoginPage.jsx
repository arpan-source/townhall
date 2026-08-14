import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { register, handleSubmit } = useForm();

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const { login, profile } = useAuth();

  async function onSubmit(values) {
    setError("");
    setLoading(true);

    const { error } = await login(values.email, values.password);

    if (error) {
      setError(error.message || "Unable to sign in.");

      setLoading(false);
      return;
    }
    if (profile?.is_active === false) {
      navigate("/pending-approval");
      return;
    }

    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl p-8 shadow-xl border border-slate-800">
        <h1 className="text-3xl font-bold text-white">TownHall</h1>

        <p className="text-slate-400 mt-2">Sign in to continue</p>

        {error && (
          <div className="mt-5 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-8">
          {/* Email */}
          <div>
            <label className="text-sm text-slate-300">Email</label>

            <input
              {...register("email", {
                required: "Email is required",
              })}
              type="email"
              className="w-full mt-2 rounded-lg bg-slate-800 border border-slate-700 p-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-300">Password</label>

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Forgot password?
              </button>
            </div>

            <div className="relative mt-2">
              <input
                {...register("password", {
                  required: "Password is required",
                })}
                type={showPassword ? "text" : "password"}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 p-3 pr-12 text-white outline-none focus:border-indigo-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Sign In */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg py-3 font-semibold text-white transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Signup */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
