import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { register, handleSubmit } = useForm();

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth();

async function onSubmit(values) {
    console.log("Submit clicked");
    console.log(values);

  const { error } = await login(
    values.email,
    values.password
  );
    console.log("Login response:", error);

  if (error) {
    console.error(error);
    return;
  }

  navigate("/dashboard");
}


  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl p-8 shadow-xl border border-slate-800">

        <h1 className="text-3xl font-bold text-white">
          TownHall
        </h1>

        <p className="text-slate-400 mt-2">
          Sign in to continue
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 mt-8"
        >

          <div>
            <label className="text-sm text-slate-300">
              Email
            </label>

            <input
              {...register("email")}
              type="email"
              className="w-full mt-2 rounded-lg bg-slate-800 border border-slate-700 p-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">
              Password
            </label>

            <div className="relative mt-2">

              <input
                {...register("password", { required: true })}
                type={showPassword ? "text" : "password"}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 p-3 pr-12 text-white outline-none focus:border-indigo-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-3 top-3 text-slate-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>

            </div>
          </div>

          <button
            className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-lg py-3 font-semibold text-white transition"
          >
            Sign In
          </button>

        </form>

      </div>
    </div>
  );
}