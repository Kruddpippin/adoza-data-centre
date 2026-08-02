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
  { label: "Validator", email: "verifier@adoza.ng" },
  { label: "Committee", email: "committee@adoza.ng" },
];

function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 48 48" width="16" height="16" {...props}>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 38c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

function YouthPasswordSignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label="Your email address" required>
        <Input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@gmail.com"
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
      <p className="text-center text-[11px] text-muted-foreground">
        Only works if you've set a password from your portal. Otherwise use the email link or Google option instead.
      </p>
    </form>
  );
}

function YouthSignIn() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        // Lets the handle_new_user() trigger tell a youth self-service signup apart
        // from a staff account (which is always admin-provisioned with a password) —
        // without this, every new signup was defaulting to a staff role.
        data: { signup_source: "youth_portal" },
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  };

  const continueWithGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/login` },
    });
    if (err) {
      setError(err.message);
      setGoogleLoading(false);
    }
    // On success the browser navigates away to Google, so no further state update happens here.
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <CheckCircle2 className="h-8 w-8 text-primary" aria-hidden />
        <p className="text-sm font-medium">Check your email</p>
        <p className="text-xs text-muted-foreground">
          We sent a confirmation link to <span className="font-medium">{email}</span>. Open it on this device — it'll bring you right back here, signed in.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        loading={googleLoading}
        disabled={loading}
        onClick={continueWithGoogle}
      >
        <GoogleIcon /> Continue with Google
      </Button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

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
        <Button type="submit" className="w-full" loading={loading} disabled={googleLoading}>
          <Mail className="h-4 w-4" /> Send me a sign-in link
        </Button>
      </form>
      <p className="text-center text-[11px] text-muted-foreground">
        New here? Either option lets you register. Already registered by a field officer? It'll show your status instead.
      </p>
    </div>
  );
}

function StaffApply() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/staff-application`,
        data: { signup_source: "staff_application" },
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  };

  const continueWithGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/staff-application` },
    });
    if (err) {
      setError(err.message);
      setGoogleLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <CheckCircle2 className="h-8 w-8 text-primary" aria-hidden />
        <p className="text-sm font-medium">Check your email</p>
        <p className="text-xs text-muted-foreground">
          We sent a confirmation link to <span className="font-medium">{email}</span>. Open it to continue your application.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        loading={googleLoading}
        disabled={loading}
        onClick={continueWithGoogle}
      >
        <GoogleIcon /> Continue with Google
      </Button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

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
        <Button type="submit" className="w-full" loading={loading} disabled={googleLoading}>
          <Mail className="h-4 w-4" /> Send me a sign-in link
        </Button>
      </form>
      <p className="text-center text-[11px] text-muted-foreground">
        You'll pick which role you're applying for after signing in. An administrator reviews every application.
      </p>
    </div>
  );
}

export default function Login() {
  const { session, signIn, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("staff");
  const [staffView, setStaffView] = useState("signin");
  const [youthView, setYouthView] = useState("signin");
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
            staffView === "signin" ? (
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

                <button
                  type="button"
                  onClick={() => setStaffView("apply")}
                  className="mt-4 w-full text-center text-[11px] font-medium text-primary hover:underline"
                >
                  New here? Apply to join the team
                </button>
              </>
            ) : (
              <>
                <StaffApply />
                <button
                  type="button"
                  onClick={() => setStaffView("signin")}
                  className="mt-4 w-full text-center text-[11px] font-medium text-primary hover:underline"
                >
                  Already have staff credentials? Sign in instead
                </button>
              </>
            )
          ) : youthView === "signin" ? (
            <>
              <YouthPasswordSignIn />
              <button
                type="button"
                onClick={() => setYouthView("register")}
                className="mt-4 w-full text-center text-[11px] font-medium text-primary hover:underline"
              >
                New here? Register
              </button>
            </>
          ) : (
            <>
              <YouthSignIn />
              <button
                type="button"
                onClick={() => setYouthView("signin")}
                className="mt-4 w-full text-center text-[11px] font-medium text-primary hover:underline"
              >
                Already registered? Sign in instead
              </button>
            </>
          )}
        </Card>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          {mode === "staff" ? "Authorised programme staff only. Activity is audited." : "For youths registering with the ADOZA empowerment programme."}
        </p>
      </div>
    </div>
  );
}
