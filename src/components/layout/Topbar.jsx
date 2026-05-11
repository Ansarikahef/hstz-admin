import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Sun, Moon, LogOut, Search, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { toast } from "sonner";

export default function Topbar({ onToggleSidebar, onToggleMobile, dark, setDark }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const doLogout = () => {
    logout();
    setConfirmLogout(false);
    toast.success("Signed out", { description: "You have been logged out securely." });
    navigate("/login", { replace: true });
  };

  return (
    <>
      <header
        data-testid="topbar"
        className="sticky top-0 z-20 backdrop-blur bg-[var(--hz-bg)]/80 border-b border-[var(--hz-border)]"
      >
        <div className="px-4 sm:px-6 lg:px-10 h-[68px] flex items-center gap-3">
          <button
            data-testid="topbar-mobile-menu"
            className="lg:hidden hz-btn-ghost !h-10 !px-3"
            onClick={onToggleMobile}
            aria-label="Open menu"
          >
            <Menu className="size-5" strokeWidth={1.5} />
          </button>
          <button
            data-testid="topbar-desktop-toggle"
            className="hidden lg:inline-flex hz-btn-ghost !h-10 !px-3"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu className="size-5" strokeWidth={1.5} />
          </button>

          <div className="hidden md:flex items-center gap-2 ml-2 text-[11px] tracking-[0.2em] uppercase text-[var(--hz-text-2)]">
            <span>HS Travel Zone</span>
            <span>·</span>
            <span>Admin Console</span>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {/* <div className="hidden md:block hz-input-wrap w-72">
              <Search className="hz-input-icon size-4" strokeWidth={1.5} />
              <input
                data-testid="topbar-search"
                className="hz-input !h-10"
                placeholder="Search packages, users…"
              />
            </div> */}
            <button
              data-testid="topbar-notifications"
              className="hz-btn-ghost !h-10 !w-10 !px-0 justify-center relative"
              aria-label="Notifications"
            >
              <Bell className="size-[18px]" strokeWidth={1.5} />
              <span className="absolute top-2 right-2 size-1.5 rounded-full bg-[var(--hz-cta)] hz-pulse-ring" />
            </button>
            <button
              data-testid="topbar-darkmode-toggle"
              className="hz-btn-ghost !h-10 !w-10 !px-0 justify-center"
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="size-[18px]" strokeWidth={1.5} /> : <Moon className="size-[18px]" strokeWidth={1.5} />}
            </button>

            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-[var(--hz-border)]">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="size-9 rounded-full object-cover"
              />
              <div className="leading-tight">
                <div className="text-[13px] font-medium text-[var(--hz-text)]">{user?.name}</div>
                <div className="text-[11px] text-[var(--hz-text-2)] tracking-wide">{user?.role}</div>
              </div>
            </div>

            <button
              data-testid="topbar-logout"
              className="hz-btn-ghost !h-10 !w-10 !px-0 justify-center"
              onClick={() => setConfirmLogout(true)}
              aria-label="Sign out"
            >
              <LogOut className="size-[18px]" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <ConfirmModal
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={doLogout}
        title="Sign out of HZ Travel Zone?"
        description="You'll be returned to the sign-in page. Any unsaved drafts on this device remain stored locally."
        confirmLabel="Sign out"
        tone="danger"
        icon={<LogOut className="size-5" strokeWidth={1.5} />}
        testid="logout"
      />
    </>
  );
}
