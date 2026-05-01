import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { db } from "@/lib/mockData";

export default function AdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    const s = db.load();
    return s.settings?.sidebarCollapsed || false;
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(() => db.load().settings?.darkMode || false);

  useEffect(() => {
    const s = db.load();
    s.settings = { ...(s.settings || {}), sidebarCollapsed: collapsed, darkMode: dark };
    db.save(s);
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [collapsed, dark]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen w-full" data-testid="admin-layout">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div
        className="flex flex-1 flex-col min-w-0 transition-[margin] duration-300"
        style={{ marginLeft: 0 }}
      >
        <Topbar
          onToggleSidebar={() => setCollapsed((c) => !c)}
          onToggleMobile={() => setMobileOpen((m) => !m)}
          dark={dark}
          setDark={setDark}
        />
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          <div className="hz-fade-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
