import { Link, NavLink } from "react-router-dom";
import { LogOut, UserRound, GraduationCap, Handshake } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { NotificationsBell } from "@/components/NotificationsBell";
import { cn, initialsOf } from "@/lib/utils";

const TABS = [
  { to: "/my-registration", label: "My Registration", icon: UserRound },
  { to: "/tech-hub", label: "Tech Hub", icon: GraduationCap },
  { to: "/outsource-staff", label: "Outsource Staff", icon: Handshake },
];

// The tab strip shared by every candidate-facing page (registration status, Tech Hub,
// Outsource Staff) so moving between them is always one tap away. Exported separately
// from the full header so YouthPortal.jsx can drop it into its own richer header without
// duplicating the header row (which has bank/delivery/account-deletion menu items that
// only make sense on that page).
export function CandidatePortalTabs({ className }) {
  return (
    <nav className={cn("flex gap-1 overflow-x-auto rounded-xl border bg-card p-1", className)} aria-label="Candidate portal sections">
      {TABS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors",
              isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )
          }
        >
          <Icon className="h-3.5 w-3.5" aria-hidden /> {label}
        </NavLink>
      ))}
    </nav>
  );
}

// A lighter header for the Tech Hub / Outsource Staff pages — logo, candidate name,
// notifications, sign out. The fuller account menu (password, bank/delivery details,
// delete account) stays specific to the registration page it's defined on.
export function CandidatePortalNav({ youth }) {
  const { signOut } = useAuth();
  const initials = initialsOf(youth ? `${youth.first_name} ${youth.last_name}` : "");

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center justify-between">
        <Link to="/my-registration" className="flex items-center gap-2.5">
          <img src="/kogi-logo.png" alt="ADOZA Data Centre" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
          <div>
            <p className="font-display text-sm font-bold tracking-tight">
              {youth ? `${youth.first_name} ${youth.last_name}` : "ADOZA Data Centre"}
            </p>
            <p className="text-[11px] text-muted-foreground">Candidate Dashboard</p>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <NotificationsBell />
          {youth?.photo_url ? (
            <img src={youth.photo_url} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {initials || "U"}
            </div>
          )}
          <button
            onClick={signOut}
            aria-label="Sign out"
            title="Sign out"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
      <CandidatePortalTabs />
    </div>
  );
}
