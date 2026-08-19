import { Link } from "react-router-dom";
import { UserCog } from "lucide-react";
import { Button } from "@/components/ui";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";

const REQUIREMENTS = [
  "At least 18 years old",
  "Not currently benefiting from another scheme",
  "Valid means of identification",
  "Willingness to participate in training",
];

function NavLink({ to, state, active, children }) {
  return (
    <Link
      to={to}
      state={state}
      className={cn(
        "border-b-2 pb-0.5 text-sm font-semibold uppercase tracking-wide transition-colors",
        active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}

export default function Landing() {
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      <header className="shrink-0 border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="ADOZA Data Centre home">
            <img
              src="/kogi-logo.png"
              alt="ADOZA Data Centre"
              width={36}
              height={36}
              decoding="async"
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
            <p className="font-display truncate text-sm font-bold tracking-tight sm:text-base">
              ADOZA Data Centre
            </p>
          </Link>

          <nav className="hidden items-center gap-6 sm:flex" aria-label="Primary">
            <NavLink to="/" active>Home</NavLink>
            <NavLink to="/login?portal=candidate">Apply</NavLink>
            <NavLink to="/login?portal=staff">Staff Login</NavLink>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {/* The full nav (with Staff Login) is sm:flex-only above, so mobile needs its
                own always-visible way in — otherwise staff have no login path on a phone. */}
            <Link to="/login?portal=staff" className="sm:hidden">
              <Button variant="outline" size="icon" aria-label="Staff Login">
                <UserCog className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login?portal=candidate">
              <Button size="sm" className="rounded-full px-5">
                Check Status
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col justify-center overflow-y-auto">
        <section className="relative overflow-hidden px-4 py-4 text-center sm:py-6">
          <img
            src="/img/dashboard-welcome.webp"
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-[center_28%]"
          />
          <div className="absolute inset-0 bg-primary/90" />
          <div className="relative">
            <p className="animate-fade-up text-xs font-bold uppercase tracking-widest text-primary-foreground">
              SYB Door-to-Door Youth Empowerment — Kogi Central
            </p>
            <p className="animate-fade-up stagger-2 mt-1.5 text-base text-primary-foreground sm:text-lg">
              Registration is now open
            </p>
            <div className="animate-fade-up stagger-3 mt-3">
              <Link to="/login?portal=candidate">
                <Button size="lg" variant="accent">Apply Now</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-3xl px-4 py-3 sm:py-4">
          <div className="animate-fade-up stagger-2 rounded-xl border bg-card p-4 shadow-sm sm:p-5">
            <h2 className="font-display text-xl font-bold tracking-tight text-primary underline decoration-2 underline-offset-4 sm:text-2xl">
              Registration Invitation
            </h2>
            <p className="mt-2 text-sm text-foreground sm:text-base">
              All qualified Adoza youths are invited to register for the{" "}
              <strong className="font-semibold">2026 ADOZA Empowerment Programme</strong>.
            </p>
            <ul className="mt-2 space-y-1.5">
              {REQUIREMENTS.map((r) => (
                <li key={r} className="flex items-start gap-2.5 text-sm sm:text-base">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  {r}
                </li>
              ))}
            </ul>
            <Link to="/login?portal=candidate" className="mt-4 block sm:inline-block">
              <Button size="lg" className="w-full sm:w-auto">Apply Now</Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
