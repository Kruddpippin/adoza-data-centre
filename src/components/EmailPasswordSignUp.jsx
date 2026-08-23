import { useState } from "react";
import { ChevronDown, ChevronUp, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button, Input, Field } from "@/components/ui";

// Additive third sign-up option alongside Google and magic-link (never replaces them).
// Starts collapsed so it doesn't compete with the two recommended options above it.
// Structurally mirrors PasswordSettingsForm.jsx's password/confirm validation, but calls
// signUp (new account) instead of updateUser (existing account, already signed in).
export function EmailPasswordSignUp({ email, onEmailChange, signupSource, onSuccess }) {
  const { signUp } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    const { data, error: err } = await signUp(email.trim(), password, signupSource);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    // Supabase's anti-enumeration behavior: signing up with an email that already has
    // an account returns no error, but an empty identities array instead of a real one.
    if (data.user && data.user.identities?.length === 0) {
      setError("An account already exists for this email — try signing in instead.");
      return;
    }
    if (!data.session) {
      setError("Something went wrong creating your account — please try again.");
      return;
    }
    setPassword("");
    setConfirm("");
    onSuccess?.();
  };

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="flex w-full items-center justify-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        Or create a password instead <ChevronDown className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border bg-muted/30 p-3">
      <button
        type="button"
        onClick={() => setExpanded(false)}
        className="flex w-full items-center justify-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        Create a password <ChevronUp className="h-3.5 w-3.5" />
      </button>
      <form onSubmit={submit} className="space-y-3" noValidate>
        <Field label="Email" required>
          <Input type="email" autoComplete="email" value={email} onChange={(e) => onEmailChange(e.target.value)} placeholder="you@gmail.com" />
        </Field>
        <Field label="Password" required error={error}>
          <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••" />
        </Field>
        <Field label="Confirm password" required>
          <Input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••••" />
        </Field>
        <Button type="submit" variant="outline" className="w-full" loading={loading}>
          <UserPlus className="h-4 w-4" /> Create account
        </Button>
      </form>
    </div>
  );
}
