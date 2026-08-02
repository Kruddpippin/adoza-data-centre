import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { LogIn, Eye, EyeOff, Mail, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button, Input, Field, Card } from "@/components/ui";
import { cn } from "@/lib/utils";

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@adoza.ng" },
  { label: "Enumerator", email: "enumerator@adoza.ng" },
  { label: "Verifier", email: "verifier@adoza.ng" },
  { label: "Committee", email: "committee@adoza.ng" },
];

function YouthSignIn() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/my-registration` },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <CheckCircle2 className="h-8 w-8 text-primary" aria-hidden />
        <p className="text-sm font-medium">Check your email</p>
        <p className="text-xs text-muted-foreground">
          We sent a sign-in link to <span className="font-medium">{email}</span>. Open it on this device to continue.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label="Your email address" required error={error}>
        <Input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@gmail.com"
        />
      </Field>
      <Button type="submit" className="w-full" loading={loading}>
        <Mail className="h-4 w-4" /> Send me a sign-in link
      </Button>
      <p className="text-center text-[11px] text-muted-foreground">
        New here? The same link lets you register. Already registered by a field officer? It'll show your status instead.
      </p>
    </form>
  );
}

export default function Login() {
  const { session, signIn, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("staff");
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

        <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl border bg-card p-1">
          <button
            type="button"
            onClick={() => setMode("staff")}
            className={cn(
              "rounded-lg py-1.5 text-sm font-medium transition-colors",
              mode === "staff" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Staff login
          </button>
          <button
            type="button"
            onClick={() => setMode("youth")}
            className={cn(
              "rounded-lg py-1.5 text-sm font-medium transition-colors",
              mode === "youth" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Youth sign in / register
          </button>
        </div>

        <Card className="p-6">
          {mode === "staff" ? (
            <>
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
            </>
          ) : (
            <YouthSignIn />
          )}
        </Card>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          {mode === "staff" ? "Authorised programme staff only. Activity is audited." : "For youths registering with the ADOZA empowerment programme."}
        </p>
      </div>
    </div>
  );
}
