import { useEffect, useState } from "react";
import { useLocation, useSearchParams, Navigate, Link } from "react-router-dom";
import { LogIn, Eye, EyeOff, Mail, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button, Input, Field, Card } from "@/components/ui";
import { getStoredPortal, setStoredPortal } from "@/lib/portal";

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

function ForgotPassword({ email, redirectTo }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  const send = async () => {
    setErr("");
    if (!email.trim()) {
      setErr("Enter your email address above first.");
      return;
    }
    setSending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    setSending(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <p className="text-center text-[11px] text-muted-foreground">
        Password reset link sent to <span className="font-medium">{email}</span>.
      </p>
    );
  }

  return (
    <div className="text-center">
      <button
        type="button"
        onClick={send}
        disabled={sending}
        className="text-[11px] font-medium text-primary hover:underline disabled:opacity-50"
      >
        {sending ? "Sending…" : "Forgot password?"}
      </button>
      {err && <p className="mt-1 text-[11px] font-medium text-destructive">{err}</p>}
    </div>
  );
}

function YouthPasswordSignIn() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
    // Success falls through to Login()'s own top-level redirect/enforcement logic,
    // which verifies this account is actually a candidate before sending it anywhere.
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
        <Button type="submit" className="w-full" loading={loading} disabled={googleLoading}>
          <LogIn className="h-4 w-4" /> Sign in
        </Button>
        <ForgotPassword email={email} redirectTo={`${window.location.origin}/reset-password?portal=candidate`} />
        <p className="text-center text-[11px] text-muted-foreground">
          Only works if you've set a password from your portal. Otherwise use Google or the email link instead.
        </p>
      </form>
    </div>
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
  const { session, profile, signIn, loading: authLoading, profileLoading } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  // A staff Google sign-in does a full-page round trip through Google and back to
  // /login, which remounts this component and loses the `mode` a plain click would
  // have kept — so the staff Google button tags its redirect with ?portal=staff to
  // survive that trip. When there's no explicit ?portal= tag at all (a sign-out
  // redirect, a session timing out, a stale bookmark), fall back to whichever portal
  // was last selected on the homepage rather than defaulting to candidate — a staff
  // member should land back on the staff login, not get bounced to the candidate one.
  const queryPortal = searchParams.get("portal");
  const [mode, setMode] = useState(() => {
    if (queryPortal === "staff") return "staff";
    if (queryPortal === "candidate" || queryPortal === "youth") return "youth";
    return getStoredPortal();
  });

  useEffect(() => {
    setStoredPortal(mode);
  }, [mode]);
  const [staffView, setStaffView] = useState("signin");
  // Sign in is always the first thing a candidate sees, even coming from a "Register"/
  // "Apply Now" CTA elsewhere — they switch to Register themselves if they need to.
  const [youthView, setYouthView] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [portalError, setPortalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const settled = !authLoading && !profileLoading && !!session;
  // A Google sign-in that lands here in "youth" mode (rather than "staff") almost
  // always means the OAuth redirect lost the ?portal=staff tag somewhere along the
  // way (e.g. a provider redirect fallback) rather than the user actually meaning to
  // use the candidate tab — an authenticated staff account should never be bounced
  // just because of that. Auto-correct instead of hard-erroring for this one case.
  const isGoogleSession = session?.user?.app_metadata?.provider === "google";
  const misroutedStaffGoogleSignIn = settled && mode === "youth" && !!profile && isGoogleSession;

  useEffect(() => {
    if (misroutedStaffGoogleSignIn) setMode("staff");
  }, [misroutedStaffGoogleSignIn]);

  // Staff accounts have a `profiles` row; candidates never do (by design — see
  // handle_new_user). A session that doesn't match the tab it signed in from means
  // someone used, say, candidate credentials on the staff tab — Supabase Auth itself
  // has no concept of "portal," so it happily authenticates either way. Reject that
  // combination outright instead of quietly routing them to the other portal.
  const wrongPortal =
    settled && !misroutedStaffGoogleSignIn && ((mode === "staff" && !profile) || (mode === "youth" && !!profile));

  useEffect(() => {
    if (!wrongPortal) return;
    supabase.auth.signOut();
    setPortalError(
      mode === "staff"
        ? "This email isn't registered as staff. Use the Candidate tab to sign in, or apply to join the team."
        : "This email is a staff account. Use the Staff tab to sign in."
    );
  }, [wrongPortal, mode]);

  if (settled && !wrongPortal) {
    return <Navigate to={location.state?.from?.pathname ?? (profile ? "/dashboard" : "/my-registration")} replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setPortalError("");
    setLoading(true);
    const { error: err } = await signIn(email.trim(), password);
    setLoading(false);
    if (err) {
      setError(err.message === "Invalid login credentials" ? "Incorrect email or password." : err.message);
      return;
    }
    // Success falls through to the top-level redirect/enforcement logic above.
  };

  const continueWithGoogle = async () => {
    setError("");
    setPortalError("");
    setGoogleLoading(true);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/login?portal=staff` },
    });
    if (err) {
      setError(err.message);
      setGoogleLoading(false);
    }
    // On success the browser navigates away to Google, so no further state update happens here.
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
          <Link to="/" aria-label="ADOZA Data Centre home">
            <img
              src="/kogi-logo.png"
              alt="Kogi State Government"
              width={56}
              height={56}
              fetchpriority="high"
              decoding="async"
              className="h-14 w-14 rounded-full object-cover shadow-lg"
            />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">ADOZA Data Centre</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              SYB Door-to-Door Youth Empowerment — Kogi Central
            </p>
          </div>
        </div>

        {portalError && (
          <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-center text-xs font-medium text-destructive">
            {portalError}
          </p>
        )}

        <Card className="p-6">
          {mode === "staff" ? (
            staffView === "signin" ? (
              <>
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

                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

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
                  <Button type="submit" className="w-full" loading={loading} disabled={googleLoading}>
                    <LogIn className="h-4 w-4" /> Sign in
                  </Button>
                  <ForgotPassword email={email} redirectTo={`${window.location.origin}/reset-password?portal=staff`} />
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
          {mode === "staff" ? "Authorised programme staff only. Activity is audited." : "For candidates registering with the ADOZA empowerment programme."}
        </p>
      </div>
    </div>
  );
}
