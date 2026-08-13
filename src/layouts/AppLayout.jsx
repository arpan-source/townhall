import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

export default function AppLayout({ sidebarItems, children }) {
  return (
    <div className="min-h-screen flex bg-slate-950">
      <Sidebar items={sidebarItems} />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        <main id="main-content" className="flex-1 overflow-auto p-8">
          {children}
        </main>
        <div className="flex min-h-screen"></div>
      </div>
    </div>
  );
}
