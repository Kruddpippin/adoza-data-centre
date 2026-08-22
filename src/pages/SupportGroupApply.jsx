import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { LogOut, Send, Clock, XCircle, Mail, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useMySupportGroupApplication, useMySupportGroupMembership, useSubmitSupportGroupApplication } from "@/hooks/useSupportGroup";
import { Button, Input, Select, Field, Card, CardHeader, CardTitle, CardContent, Spinner, ErrorState } from "@/components/ui";
import { usePersistedState } from "@/hooks/usePersistedState";

const DESIGNATION_OPTIONS = ["Media Team", "Protocol Team", "Other"];

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

// Self-contained sign-in block for the GYB2SYB flow — mirrors StaffApply in
// Login.jsx, but with signup_source: "support_group" (already added to the
// handle_new_user trigger's skip-profile list server-side) and both redirects
// pointed at /gyb2syb so a Google round trip or a magic-link click lands back here.
function SupportGroupSignIn() {
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
        emailRedirectTo: `${window.location.origin}/gyb2syb`,
        data: { signup_source: "support_group" },
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
      options: { redirectTo: `${window.location.origin}/gyb2syb` },
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
      <Button type="button" variant="outline" className="w-full" loading={googleLoading} disabled={loading} onClick={continueWithGoogle}>
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
        You'll fill in your details after signing in. An administrator reviews every registration.
      </p>
    </div>
  );
}

function PortalHeader() {
  const { signOut } = useAuth();
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <img src="/kogi-logo.png" alt="ADOZA Data Centre" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
        <div>
          <p className="font-display text-sm font-bold tracking-tight">ADOZA Data Centre</p>
          <p className="text-[11px] text-muted-foreground">GYB2SYB Support Integration Group registration</p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={signOut}>
        <LogOut className="h-4 w-4" /> Sign out
      </Button>
    </div>
  );
}

function ApplicationStatus({ application }) {
  if (application.status === "pending") {
    return (
      <Card className="p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
          <Clock className="h-6 w-6 text-amber-700" />
        </div>
        <h1 className="font-display mt-3 text-lg font-bold tracking-tight">Registration pending</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your registration as <span className="font-medium text-foreground">{application.designation}</span> is under review.
          An administrator will approve it shortly — check back here (or just refresh) once they do.
        </p>
      </Card>
    );
  }

  if (application.status === "rejected") {
    return (
      <Card className="p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-6 w-6 text-red-700" />
        </div>
        <h1 className="font-display mt-3 text-lg font-bold tracking-tight">Registration not approved</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your registration for the GYB2SYB Support Integration Group was not approved.
        </p>
      </Card>
    );
  }

  // approved: the membership check above already redirects to the dashboard once the
  // support_group_members row exists. This is just a brief fallback while that refetches.
  return (
    <Card className="p-6 text-center">
      <h1 className="font-display text-lg font-bold tracking-tight">Registration approved</h1>
      <p className="mt-1 text-sm text-muted-foreground">Refresh this page to access your dashboard.</p>
    </Card>
  );
}

const EMPTY = { name: "", phone: "", designation: "Media Team", otherDesignation: "" };

function ApplyForm({ user }) {
  const submit = useSubmitSupportGroupApplication();
  // Keyed by user id so the draft survives a refresh without leaking between different
  // applicants on a shared device, matching StaffApplication.jsx's convention.
  const [form, setForm, clearFormDraft] = usePersistedState(`adoza-draft-support-group-apply-${user.id}`, EMPTY);
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = {};
    if (!form.name.trim()) e2.name = "Required";
    if (!form.phone.trim()) e2.phone = "Required";
    if (form.designation === "Other" && !form.otherDesignation.trim()) e2.otherDesignation = "Required";
    setErrors(e2);
    if (Object.keys(e2).length) return;

    try {
      await submit.mutateAsync({
        user_id: user.id,
        name: form.name.trim(),
        email: user.email,
        phone: form.phone.trim(),
        designation: form.designation === "Other" ? form.otherDesignation.trim() : form.designation,
      });
      clearFormDraft();
    } catch (err) {
      setErrors((prev) => ({ ...prev, _root: err.message }));
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Register for the GYB2SYB Support Integration Group</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Field label="Full name" required error={errors.name}>
            <Input value={form.name} onChange={set("name")} />
          </Field>
          <Field label="Email">
            <Input value={user?.email ?? ""} disabled readOnly />
          </Field>
          <Field label="Phone" required error={errors.phone}>
            <Input type="tel" value={form.phone} onChange={set("phone")} placeholder="+234…" />
          </Field>
          <Field label="Team / designation" required>
            <Select value={form.designation} onChange={set("designation")}>
              {DESIGNATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </Select>
          </Field>
          {form.designation === "Other" && (
            <Field label="Please specify" required error={errors.otherDesignation}>
              <Input value={form.otherDesignation} onChange={set("otherDesignation")} placeholder="e.g. Logistics Team" />
            </Field>
          )}
          {errors._root && <p className="text-sm font-medium text-destructive">{errors._root}</p>}
          <Button type="submit" className="w-full" loading={submit.isPending}>
            <Send className="h-4 w-4" /> Submit registration
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function SupportGroupApply() {
  const { session, user, loading: authLoading } = useAuth();
  const {
    data: membership, isLoading: membershipLoading, isError: membershipError, refetch: refetchMembership,
  } = useMySupportGroupMembership(user?.id);
  const {
    data: application, isLoading: applicationLoading, isError: applicationError, refetch: refetchApplication,
  } = useMySupportGroupApplication(user?.id);

  if (authLoading) return <Spinner className="min-h-screen" />;

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary/[0.04] p-4">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <Link to="/" aria-label="ADOZA Data Centre home">
              <img
                src="/kogi-logo.png"
                alt="ADOZA Data Centre"
                width={56}
                height={56}
                className="h-14 w-14 rounded-full object-cover shadow-lg"
              />
            </Link>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight">GYB2SYB Support Integration Group Registration</h1>
              <p className="mt-1 text-sm text-muted-foreground">Sign in to register as a volunteer.</p>
            </div>
          </div>
          <Card className="p-6">
            <SupportGroupSignIn />
          </Card>
        </div>
      </div>
    );
  }

  const isLoading = membershipLoading || applicationLoading;
  const isError = membershipError || applicationError;

  return (
    <div className="mx-auto min-h-screen max-w-lg p-4 lg:p-8">
      <PortalHeader />
      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState onRetry={() => { refetchMembership(); refetchApplication(); }} />
      ) : membership ? (
        <Navigate to="/gyb2syb/dashboard" replace />
      ) : application ? (
        <ApplicationStatus application={application} />
      ) : (
        <ApplyForm user={user} />
      )}
    </div>
  );
}
