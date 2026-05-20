import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tags,
  MapPinned,
  Users,
  Plane,
  Trophy,
  Compass,
  ChevronLeft,
  X,
} from "lucide-react";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", testid: "nav-dashboard" },
  { to: "/bookings", icon: LayoutDashboard, label: "Bookings", testid: "nav-bookings" },
  { to: "/packages", icon: Package, label: "Packages", testid: "nav-packages" },
  { to: "/categories", icon: Tags, label: "Categories", testid: "nav-categories" },
  { to: "/destinations", icon: MapPinned, label: "Destinations", testid: "nav-destinations" },
  { to: "/users", icon: Users, label: "Users", testid: "nav-users" },
  { to: "/travellers", icon: Plane, label: "Travellers", testid: "nav-travellers" },
  { to: "/winners", icon: Trophy, label: "Winners", testid: "nav-winners" },
];

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const width = collapsed ? "w-[80px]" : "w-[260px]";
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        data-testid="sidebar"
        className={`
          fixed lg:sticky top-0 z-50 lg:z-30 h-screen flex flex-col
          ${width} ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
          transition-all duration-300 ease-in-out
        `}
        style={{ backgroundColor: "var(--hz-sidebar)", color: "var(--hz-on-dark)" }}
      >
        {/* Brand */}
        <div className="px-5 pt-6 pb-4 flex items-center gap-3 relative">
          <div
            className="size-9 shrink-0 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--hz-cta)" }}
          >
            <Compass className="size-5 text-white" strokeWidth={1.75} />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="hz-heading text-lg leading-none font-semibold tracking-tight">HS Travel Zone</div>
              <div className="text-[11px] tracking-[0.18em] uppercase text-white/50 mt-1">Admin Console</div>
            </div>
          )}
          <button
            data-testid="sidebar-mobile-close"
            onClick={() => setMobileOpen(false)}
            className="ml-auto lg:hidden text-white/70 hover:text-white"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="px-3">
          <div className="h-px bg-white/8" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
        </div>

        {/* Nav */}
        <nav className="px-3 pt-4 flex-1 overflow-y-auto">
          {!collapsed && (
            <div className="px-2 mb-2 text-[10px] tracking-[0.22em] uppercase text-white/40">Workspace</div>
          )}
          <ul className="space-y-1">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  data-testid={item.testid}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "bg-white/[0.07] text-white"
                        : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                    } ${collapsed ? "justify-center" : ""}`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r"
                          style={{ backgroundColor: "var(--hz-cta)" }}
                        />
                      )}
                      <item.icon className="size-[18px] shrink-0" strokeWidth={1.5} />
                      {!collapsed && <span className="font-medium">{item.label}</span>}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Collapse toggle (desktop) */}
        <div className="hidden lg:flex p-3">
          <button
            data-testid="sidebar-collapse-toggle"
            onClick={() => setCollapsed(!collapsed)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white w-full ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <ChevronLeft
              className={`size-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
              strokeWidth={1.5}
            />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>

        {/* Footer */}
        {!collapsed && (
          <div className="px-5 pb-5 text-[11px] tracking-wide text-white/35">
            v1.0 · {new Date().getFullYear()}
          </div>
        )}
      </aside>
    </>
  );
}
