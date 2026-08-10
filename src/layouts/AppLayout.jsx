import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

export default function AppLayout({
  sidebarItems,
  children,
}) {
  return (
    <div className="min-h-screen flex bg-slate-950">

      <Sidebar items={sidebarItems} />

      <div className="flex-1 flex flex-col">

        <Topbar />

        <main className="flex-1 overflow-auto p-8 bg-slate-950">
          {children}
        </main>

      </div>

    </div>
  );
}