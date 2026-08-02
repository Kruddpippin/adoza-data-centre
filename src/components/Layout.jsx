import { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Map, Award, Package, Banknote, ClipboardList,
  UserCog, Shield, Menu, X, LogOut, Bell, Smartphone,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications, useMarkNotificationsRead } from "@/hooks/useData";
import { cn, ROLE_LABELS, ROLE_COLORS, initialsOf, formatDateTime, ADMIN_ROLES } from "@/lib/utils";

// Self-hosted APK (public/downloads/) so the link never expires like EAS's own build-artifact URLs do.
// Re-download and replace this file after each new `eas build` to keep it current.
const ANDROID_APP_URL = "/downloads/adoza-data-centre.apk";
const IOS_APP_URL = import.meta.env.VITE_IOS_APP_URL;

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["super_admin", "campaign_admin", "enumerator", "validator", "committee", "field_agent"] },
  { path: "/youths", label: "Candidates", icon: Users, roles: ["super_admin", "campaign_admin", "enumerator", "validator", "committee", "field_agent"] },
  { path: "/map", label: "Field Map", icon: Map, roles: ["super_admin", "campaign_admin", "enumerator", "validator", "committee", "field_agent"] },
  { path: "/beneficiaries", label: "Beneficiaries", icon: Award, roles: ["super_admin", "campaign_admin", "validator", "committee"] },
  { path: "/equipment", label: "Equipment", icon: Package, roles: ["super_admin", "campaign_admin", "committee"] },
  { path: "/funding", label: "Funding", icon: Banknote, roles: ["super_admin", "campaign_admin", "committee"] },
  { path: "/surveys", label: "Surveys", icon: ClipboardList, roles: ["super_admin", "campaign_admin", "enumerator", "validator", "committee", "field_agent"] },
  { path: "/users", label: "Team", icon: UserCog, roles: ADMIN_ROLES },
  { path: "/audit", label: "Audit Log", icon: Shield, roles: ADMIN_ROLES },
];

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return { open, setOpen, ref };
}

function NotificationsBell() {
  const { user } = useAuth();
  const { data: notifications = [] } = useNotifications(user?.id);
  const markRead = useMarkNotificationsRead(user?.id);
  const { open, setOpen, ref } = useDropdown();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setOpen(!open);
          if (!open && unread) markRead.mutate();
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-xl border bg-card p-1.5 shadow-lg" role="menu">
          <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Notifications</p>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && <p className="px-2.5 py-6 text-center text-xs text-muted-foreground">Nothing yet.</p>}
            {notifications.map((n) => (
              <div key={n.id} className="rounded-lg px-2.5 py-2 hover:bg-muted">
                <p className="text-xs font-semibold">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.message}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground/70">{formatDateTime(n.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Layout() {
  const navigate = useNavigate();
  const { profile, role, signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const userMenu = useDropdown();

  const visibleNav = NAV_ITEMS.filter((i) => role && i.roles.includes(role));
  const initials = initialsOf(profile?.name);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-muted/40">
      {drawerOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setDrawerOpen(false)} aria-hidden />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-200 lg:static lg:z-auto lg:w-60 lg:translate-x-0",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <img
              src="/kogi-logo.png"
              alt="Kogi State Government"
              width={32}
              height={32}
              decoding="async"
              className="h-8 w-8 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 leading-tight">
              <p className="font-display truncate text-sm font-bold tracking-tight">ADOZA</p>
              <p className="truncate text-[10px] text-muted-foreground">Data Centre</p>
            </div>
          </div>
          <button onClick={() => setDrawerOpen(false)} className="rounded-md p-1 text-muted-foreground hover:bg-muted lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2" aria-label="Main navigation">
          <ul className="space-y-0.5">
            {visibleNav.map(({ path, label, icon: Icon }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-all",
                      isActive
                        ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_hsl(152_65%_22%_/_0.15)]"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="shrink-0 border-t p-3">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{profile?.name ?? "User"}</p>
              {role && (
                <span className={cn("inline-block rounded px-1.5 py-0.5 text-[10px] font-medium", ROLE_COLORS[role])}>
                  {ROLE_LABELS[role]}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t p-2">
          <p className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Get the mobile app
          </p>
          <a
            href={ANDROID_APP_URL}
            download
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <Smartphone className="h-4 w-4 shrink-0" />
            Download for Android
          </a>
          {IOS_APP_URL && (
            <a
              href={IOS_APP_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            >
              <Smartphone className="h-4 w-4 shrink-0" />
              Download for iOS
            </a>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-card px-4 lg:px-6">
          <button onClick={() => setDrawerOpen(true)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <p className="font-display text-sm font-bold lg:hidden">ADOZA Data Centre</p>
          <p className="hidden text-xs text-muted-foreground lg:block">
            SYB Door-to-Door Candidate Empowerment Programme — Kogi State
          </p>

          <div className="ml-auto flex items-center gap-1">
            <NotificationsBell />
            <div ref={userMenu.ref} className="relative">
              <button
                onClick={() => userMenu.setOpen(!userMenu.open)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground hover:opacity-90"
                aria-label="User menu"
                aria-expanded={userMenu.open}
              >
                {initials}
              </button>
              {userMenu.open && (
                <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border bg-card p-1.5 shadow-lg" role="menu">
                  <div className="px-2.5 py-2">
                    <p className="text-sm font-medium">{profile?.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{profile?.email}</p>
                  </div>
                  <div className="my-1 border-t" />
                  <button
                    role="menuitem"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
