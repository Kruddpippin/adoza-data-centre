import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button, Input, Field, Card } from "@/components/ui";

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@adoza.ng" },
  { label: "Enumerator", email: "enumerator@adoza.ng" },
  { label: "Verifier", email: "verifier@adoza.ng" },
  { label: "Committee", email: "committee@adoza.ng" },
];

export default function Login() {
  const { session, signIn, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!authLoading && session) {
    return <Navigate to={location.state?.from?.pathname ?? "/dashboard"} replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await signIn(email.trim(), password);
    setLoading(false);
    if (err) {
      setError(err.message === "Invalid login credentials" ? "Incorrect email or password." : err.message);
      return;
    }
    navigate(location.state?.from?.pathname ?? "/dashboard", { replace: true });
  };

  const quickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("Password123!");
    setError("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <img
            src="/kogi-logo.png"
            alt="Kogi State Government"
            width={56}
            height={56}
            fetchpriority="high"
            decoding="async"
            className="h-14 w-14 rounded-full object-cover shadow-lg"
          />
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">ADOZA Data Centre</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              SYB Door-to-Door Youth Empowerment — Kogi State
            </p>
          </div>
        </div>

        <Card className="p-6">
          <form onSubmit={submit} className="space-y-4" noValidate>
            <Field label="Email address" required>
              <Input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@adoza.ng"
              />
            </Field>
            <Field label="Password" required error={error}>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            <Button type="submit" className="w-full" loading={loading}>
              <LogIn className="h-4 w-4" /> Sign in
            </Button>
          </form>

          <div className="mt-5 border-t pt-4">
            <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Demo accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((d) => (
                <Button key={d.email} type="button" variant="outline" size="sm" onClick={() => quickFill(d.email)}>
                  {d.label}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Authorised programme staff only. Activity is audited.
        </p>
      </div>
    </div>
  );
}
