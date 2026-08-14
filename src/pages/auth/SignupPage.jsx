import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { signup } = useAuth();

  const password = watch("password");

  async function onSubmit(values) {
    setError("");
    setSuccess("");
    setLoading(true);

    const { error } = await signup(
      values.email,
      values.password,
      values.fullName,
    );

    if (error) {
      setError(
        error.message ||
          "Unable to create your account.",
      );

      setLoading(false);
      return;
    }

    setSuccess(
      "Account created successfully. Please check your email to verify your account.",
    );

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl p-8 shadow-xl border border-slate-800">

        <h1 className="text-3xl font-bold text-white">
          Create your account
        </h1>

        <p className="text-slate-400 mt-2">
          Join TownHall
        </p>

        {error && (
          <div className="mt-5 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3">
            <p className="text-sm text-red-400">
              {error}
            </p>
          </div>
        )}

        {success && (
          <div className="mt-5 rounded-lg border border-green-900 bg-green-950/40 px-4 py-3">
            <p className="text-sm text-green-400">
              {success}
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 mt-8"
        >

          {/* Full Name */}
          <div>
            <label className="text-sm text-slate-300">
              Full Name
            </label>

            <input
              {...register("fullName", {
                required:
                  "Full name is required",
              })}
              type="text"
              placeholder="Your full name"
              className="w-full mt-2 rounded-lg bg-slate-800 border border-slate-700 p-3 text-white outline-none focus:border-indigo-500"
            />

            {errors.fullName && (
              <p className="text-xs text-red-400 mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-slate-300">
              Work Email
            </label>

            <input
              {...register("email", {
                required:
                  "Email is required",
              })}
              type="email"
              placeholder="you@company.com"
              className="w-full mt-2 rounded-lg bg-slate-800 border border-slate-700 p-3 text-white outline-none focus:border-indigo-500"
            />

            {errors.email && (
              <p className="text-xs text-red-400 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-slate-300">
              Password
            </label>

            <div className="relative mt-2">
              <input
                {...register("password", {
                  required:
                    "Password is required",
                  minLength: {
                    value: 6,
                    message:
                      "Password must be at least 6 characters",
                  },
                })}
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Create a password"
                className="w-full rounded-lg bg-slate-800 border border-slate-700 p-3 pr-12 text-white outline-none focus:border-indigo-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword,
                  )
                }
                className="absolute right-3 top-3 text-slate-400"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="text-xs text-red-400 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm text-slate-300">
              Confirm Password
            </label>

            <div className="relative mt-2">
              <input
                {...register(
                  "confirmPassword",
                  {
                    required:
                      "Please confirm your password",
                    validate: (value) =>
                      value === password ||
                      "Passwords do not match",
                  },
                )}
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm your password"
                className="w-full rounded-lg bg-slate-800 border border-slate-700 p-3 pr-12 text-white outline-none focus:border-indigo-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword,
                  )
                }
                className="absolute right-3 top-3 text-slate-400"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="text-xs text-red-400 mt-1">
                {
                  errors.confirmPassword
                    .message
                }
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg py-3 font-semibold text-white transition"
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() =>
                navigate("/login")
              }
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}