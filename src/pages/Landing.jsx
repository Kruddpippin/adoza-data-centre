import { Link } from "react-router-dom";
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="ADOZA Data Centre home">
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
          </Link>

          <nav className="hidden items-center gap-6 sm:flex" aria-label="Primary">
            <NavLink to="/" active>Home</NavLink>
            <NavLink to="/login?portal=candidate">Apply</NavLink>
            <NavLink to="/login?portal=staff">Staff Login</NavLink>
          </nav>

          <Link to="/login?portal=candidate">
            <Button size="sm" className="rounded-full px-5">
              Check Status
            </Button>
          </Link>
        </div>
      </header>

      <main>
        <section className="bg-primary/[0.04] px-4 py-6 text-center sm:py-8">
          <p className="animate-fade-up text-xs font-bold uppercase tracking-widest text-muted-foreground">
            SYB Door-to-Door Youth Empowerment — Kogi Central
          </p>
          <p className="animate-fade-up stagger-2 mt-2 text-base text-muted-foreground sm:text-lg">
            Registration is now open
          </p>
          <div className="animate-fade-up stagger-3 mt-4">
            <Link to="/login?portal=candidate">
              <Button size="lg">Apply Now</Button>
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-6 sm:pb-8">
          <div className="animate-fade-up stagger-2 rounded-xl border bg-card p-5 shadow-sm sm:p-7">
            <h2 className="font-display text-xl font-bold tracking-tight text-primary underline decoration-2 underline-offset-4 sm:text-2xl">
              Registration Invitation
            </h2>
            <p className="mt-3 text-sm text-foreground sm:text-base">
              All qualified Adoza youths are invited to register for the{" "}
              <strong className="font-semibold">2026 ADOZA Empowerment Programme</strong>.
            </p>
            <ul className="mt-3 space-y-2">
              {REQUIREMENTS.map((r) => (
                <li key={r} className="flex items-start gap-2.5 text-sm sm:text-base">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  {r}
                </li>
              ))}
            </ul>
            <Link to="/login?portal=candidate" className="mt-5 block sm:inline-block">
              <Button size="lg" className="w-full sm:w-auto">Apply Now</Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
