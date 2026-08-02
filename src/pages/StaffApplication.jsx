import { useState } from "react";
import { Navigate } from "react-router-dom";
import { LogOut, Send, Clock, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMyStaffApplication, useSubmitStaffApplication } from "@/hooks/useData";
import { Button, Input, Select, Field, Card, CardHeader, CardTitle, CardContent, Spinner, ErrorState } from "@/components/ui";
import { APPLICABLE_ROLES, ROLE_LABELS } from "@/lib/utils";

function PortalHeader() {
  const { signOut } = useAuth();
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <img src="/kogi-logo.png" alt="Kogi State Government" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
        <div>
          <p className="font-display text-sm font-bold tracking-tight">ADOZA Data Centre</p>
          <p className="text-[11px] text-muted-foreground">Staff application</p>
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
        <h1 className="font-display mt-3 text-lg font-bold tracking-tight">Application pending</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You applied for <span className="font-medium text-foreground">{ROLE_LABELS[application.applied_role]}</span>.
          An administrator will review your application shortly.
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
        <h1 className="font-display mt-3 text-lg font-bold tracking-tight">Application not approved</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your application for {ROLE_LABELS[application.applied_role]} was not approved.
        </p>
      </Card>
    );
  }

  // approved: the next sign-in picks up their real profile/role and lands in the dashboard.
  return (
    <Card className="p-6 text-center">
      <h1 className="font-display text-lg font-bold tracking-tight">Application approved</h1>
      <p className="mt-1 text-sm text-muted-foreground">Please sign out and sign back in to access your account.</p>
    </Card>
  );
}

function ApplyForm({ user }) {
  const submit = useSubmitStaffApplication();
  const [name, setName] = useState("");
  const [appliedRole, setAppliedRole] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !appliedRole) {
      setError("Please fill in your name and choose a role.");
      return;
    }
    try {
      await submit.mutateAsync({
        user_id: user.id,
        name: name.trim(),
        email: user.email,
        applied_role: appliedRole,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Card>
        <CardHeader><CardTitle>Apply to join the team</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Full name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email">
            <Input value={user?.email ?? ""} disabled />
          </Field>
          <Field label="Role you're applying for" required>
            <Select value={appliedRole} onChange={(e) => setAppliedRole(e.target.value)}>
              <option value="">Select a role…</option>
              {APPLICABLE_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </Select>
          </Field>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          <Button type="submit" className="w-full" loading={submit.isPending}>
            <Send className="h-4 w-4" /> Submit application
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

export default function StaffApplication() {
  const { session, user, loading: authLoading } = useAuth();
  const { data: application, isLoading, isError, refetch } = useMyStaffApplication(user?.id);

  if (authLoading) return <Spinner className="min-h-screen" />;
  if (!session) return <Navigate to="/login" replace />;

  return (
    <div className="mx-auto min-h-screen max-w-lg p-4 lg:p-8">
      <PortalHeader />
      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : application ? (
        <ApplicationStatus application={application} />
      ) : (
        <ApplyForm user={user} />
      )}
    </div>
  );
}
