import { Link } from "react-router-dom";
import { Button } from "@/components/ui";
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <img
              src="/kogi-logo.png"
              alt="Kogi State Government"
              width={36}
              height={36}
              decoding="async"
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
            <p className="font-display truncate text-sm font-bold tracking-tight sm:text-base">
              ADOZA Data Centre
            </p>
          </div>

          <nav className="hidden items-center gap-6 sm:flex" aria-label="Primary">
            <NavLink to="/" active>Home</NavLink>
            <NavLink to="/login" state={{ intent: "register" }}>Apply</NavLink>
          </nav>

          <Link to="/login">
            <Button size="sm" className="rounded-full px-5">
              Check Status
            </Button>
          </Link>
        </div>
      </header>

      <main>
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4 py-16 text-center sm:py-24">
          <p className="animate-fade-up text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            SYB Door-to-Door Candidate Empowerment — Kogi State
          </p>
          <h1 className="font-display animate-fade-up stagger-1 mt-3 text-4xl font-extrabold tracking-tight text-primary sm:text-5xl lg:text-6xl">
            ADOZA 2026 — Batch A
          </h1>
          <p className="animate-fade-up stagger-2 mt-4 text-base text-muted-foreground sm:text-lg">
            Registration is now open
          </p>
          <div className="animate-fade-up stagger-3 mt-8">
            <Link to="/login" state={{ intent: "register" }}>
              <Button size="lg">Apply Now</Button>
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-16 sm:pb-24">
          <div className="animate-fade-up stagger-2 rounded-xl border bg-card p-6 shadow-sm sm:p-10">
            <h2 className="font-display text-xl font-bold tracking-tight text-primary underline decoration-2 underline-offset-4 sm:text-2xl">
              ADOZA Registration Invitation
            </h2>
            <p className="mt-4 text-sm text-foreground sm:text-base">
              All qualified Adoza youths are invited to register for the{" "}
              <strong className="font-semibold">2026 ADOZA Empowerment Programme — Batch A</strong>.
            </p>
            <ul className="mt-5 space-y-3">
              {REQUIREMENTS.map((r) => (
                <li key={r} className="flex items-start gap-2.5 text-sm sm:text-base">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  {r}
                </li>
              ))}
            </ul>
            <Link to="/login" state={{ intent: "register" }} className="mt-8 block sm:inline-block">
              <Button size="lg" className="w-full sm:w-auto">Apply Now</Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
