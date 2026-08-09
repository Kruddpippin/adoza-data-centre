import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button, Input, Field, Card } from "@/components/ui";

export default function CheckStatus() {
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
      options: {
        emailRedirectTo: `${window.location.origin}/login?portal=candidate`,
        // Status-check only looks up an existing registration — it never creates one,
        // so this stays a distinct, narrower flow from the "Apply" registration path.
        shouldCreateUser: false,
      },
    });
    setLoading(false);
    if (err) {
      setError(
        /(signup|not allowed|not found|invalid)/i.test(err.message)
          ? "We couldn't find a registration for that email. Use Apply on the homepage to register first."
          : err.message
      );
      return;
    }
    setSent(true);
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
              decoding="async"
              className="h-14 w-14 rounded-full object-cover shadow-lg"
            />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Check Status</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the email you registered with to view your registration status.
            </p>
          </div>
        </div>

        <Card className="p-6">
          {sent ? (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-primary" aria-hidden />
              <p className="text-sm font-medium">Check your email</p>
              <p className="text-xs text-muted-foreground">
                We sent a sign-in link to <span className="font-medium">{email}</span>. Open it on this device to see your status.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4" noValidate>
              <Field label="Email Address" required error={error}>
                <Input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </Field>
              <Button type="submit" className="w-full" loading={loading}>
                <Mail className="h-4 w-4" /> Continue
              </Button>
            </form>
          )}
        </Card>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Not registered yet?{" "}
          <Link to="/login?portal=candidate" className="font-medium text-primary hover:underline">
            Apply here
          </Link>
        </p>
      </div>
    </div>
  );
}
