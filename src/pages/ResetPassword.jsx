import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button, Input, Field, Card, Spinner } from "@/components/ui";

export default function ResetPassword() {
  const { session, profile, loading: authLoading, profileLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const portal = searchParams.get("portal") === "staff" ? "staff" : "candidate";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setDone(true);
    setTimeout(() => navigate(profile ? "/dashboard" : "/my-registration", { replace: true }), 1200);
  };

  const settling = authLoading || profileLoading;

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary/[0.04] p-4">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Link to="/" aria-label="ADOZA Data Centre home">
            <img
              src="/kogi-logo.png"
              alt="Kogi State Government"
              width={56}
              height={56}
              decoding="async"
              className="h-14 w-14 rounded-full object-cover shadow-lg"
            />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Reset password</h1>
            <p className="mt-1 text-sm text-muted-foreground">Choose a new password for your account.</p>
          </div>
        </div>

        <Card className="p-6">
          {settling ? (
            <Spinner />
          ) : !session ? (
            <div className="space-y-3 text-center">
              <p className="text-sm text-muted-foreground">
                This reset link is invalid or has expired. Request a new one from the login page.
              </p>
              <Link to={`/login?portal=${portal}`}>
                <Button type="button" variant="outline" className="w-full">Back to sign in</Button>
              </Link>
            </div>
          ) : done ? (
            <p className="text-center text-sm font-medium text-emerald-600">
              Password updated. Taking you to your dashboard…
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-4" noValidate>
              <Field label="New password" required error={error}>
                <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••" />
              </Field>
              <Field label="Confirm password" required>
                <Input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••••" />
              </Field>
              <Button type="submit" className="w-full" loading={loading}>
                <KeyRound className="h-4 w-4" /> Save new password
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
