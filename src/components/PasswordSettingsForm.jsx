import { useState } from "react";
import { CheckCircle2, KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button, Input, Field } from "@/components/ui";

export function PasswordSettingsForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);
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
    setPassword("");
    setConfirm("");
    setSaved(true);
  };

  return (
    <div>
      <p className="mb-3 text-xs text-muted-foreground">
        Set a password so you can sign in directly next time, instead of waiting for an email link.
      </p>
      <form onSubmit={submit} className="space-y-3" noValidate>
        <Field label="New password" required error={error}>
          <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••" />
        </Field>
        <Field label="Confirm password" required>
          <Input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••••" />
        </Field>
        {saved && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> Password set. Use it next time you sign in.
          </p>
        )}
        <Button type="submit" variant="outline" className="w-full" loading={loading}>
          <KeyRound className="h-4 w-4" /> Save password
        </Button>
      </form>
    </div>
  );
}
