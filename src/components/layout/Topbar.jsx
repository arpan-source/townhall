import { notifications } from "@mantine/notifications";
import { useAuth } from "../../hooks/useAuth";
import PrimaryButton from "../ui/PrimaryButton";

export default function Topbar() {
  const { profile, logout } = useAuth();

  async function handleLogout() {
    const error = await logout();

    if (error) {
      notifications.show({
        title: "Logout failed",
        message: "Unable to sign out. Please try again.",
        color: "red",
      });

      return;
    }

    window.location.href = "/login";
  }

  return (
    <header className="w-full px-8 py-4 flex items-center justify-between border-b border-slate-800">
      <div>
        <p className="text-sm text-slate-400">Welcome back</p>

        <h2 className="text-lg font-semibold text-white">
          {profile?.full_name}
        </h2>
      </div>

      <PrimaryButton
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700"
      >
        Logout
      </PrimaryButton>
    </header>
  );
}
