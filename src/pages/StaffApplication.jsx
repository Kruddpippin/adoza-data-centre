import { useState } from "react";
import { Navigate } from "react-router-dom";
import { LogOut, Send, Clock, XCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMyStaffApplication, useSubmitStaffApplication, useMyYouthRecord } from "@/hooks/useData";
import { Button, Input, Select, Field, Card, CardHeader, CardTitle, CardContent, Spinner, ErrorState } from "@/components/ui";
import {
  APPLICABLE_ROLES, ROLE_LABELS, KOGI_LGAS, KOGI_WARDS_BY_LGA, EDUCATION_LEVELS, EMPLOYMENT_LABELS,
} from "@/lib/utils";

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

function CandidateEmailBlockedCard() {
  const { signOut } = useAuth();
  return (
    <Card className="p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden />
      </div>
      <p className="mt-3 text-sm font-semibold">This email is already registered as a candidate</p>
      <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
        Staff and candidates must use different email addresses. Sign out and apply for a staff role using a different email.
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={signOut}>
        <LogOut className="h-4 w-4" /> Sign out
      </Button>
    </Card>
  );
}

const EMPTY = {
  first_name: "", last_name: "", gender: "male", date_of_birth: "", phone: "",
  address: "", ward: "", lga: "", occupation: "", highest_education: "Secondary",
  employment_status: "unemployed", consent_given: false,
};

function ApplyForm({ user }) {
  const submit = useSubmitStaffApplication();
  const [form, setForm] = useState(EMPTY);
  const [appliedRole, setAppliedRole] = useState("");
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const setLga = (e) => {
    const lga = e.target.value;
    setForm((f) => ({ ...f, lga, ward: (KOGI_WARDS_BY_LGA[lga] ?? []).includes(f.ward) ? f.ward : "" }));
  };

  const wardOptions = KOGI_WARDS_BY_LGA[form.lga] ?? [];

  const validate = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = "Required";
    if (!form.last_name.trim()) e.last_name = "Required";
    if (!form.date_of_birth) e.date_of_birth = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.lga) e.lga = "Required";
    if (!form.ward) e.ward = "Required";
    if (!appliedRole) e.appliedRole = "Required";
    if (!form.consent_given) e.consent_given = "Consent is required to apply";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await submit.mutateAsync({
        user_id: user.id,
        name: `${form.first_name.trim()} ${form.last_name.trim()}`.trim(),
        email: user.email,
        applied_role: appliedRole,
        gender: form.gender,
        date_of_birth: form.date_of_birth,
        phone: form.phone,
        lga: form.lga,
        ward: form.ward,
        address: form.address,
        employment_status: form.employment_status,
        highest_education: form.highest_education,
        occupation: form.occupation,
        consent_given: form.consent_given,
        consent_date: new Date().toISOString(),
      });
    } catch (err) {
      setErrors((prev) => ({ ...prev, _root: err.message }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Card>
        <CardHeader><CardTitle>Personal details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" required error={errors.first_name}>
            <Input value={form.first_name} onChange={set("first_name")} />
          </Field>
          <Field label="Last name" required error={errors.last_name}>
            <Input value={form.last_name} onChange={set("last_name")} />
          </Field>
          <Field label="Gender" required>
            <Select value={form.gender} onChange={set("gender")}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
          </Field>
          <Field label="Date of birth" required error={errors.date_of_birth}>
            <Input type="date" value={form.date_of_birth} onChange={set("date_of_birth")} max={new Date().toISOString().slice(0, 10)} />
          </Field>
          <Field label="Phone" required error={errors.phone}>
            <Input type="tel" value={form.phone} onChange={set("phone")} placeholder="+234…" />
          </Field>
          <Field label="Email">
            <Input value={user?.email ?? ""} disabled />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Location</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="LGA" required error={errors.lga}>
            <Select value={form.lga} onChange={setLga}>
              <option value="">Select LGA…</option>
              {KOGI_LGAS.map((l) => <option key={l} value={l}>{l}</option>)}
            </Select>
          </Field>
          <Field label="Ward" required error={errors.ward}>
            <Select value={form.ward} onChange={set("ward")} disabled={!form.lga}>
              <option value="">{form.lga ? "Select ward…" : "Select LGA first…"}</option>
              {wardOptions.map((w) => <option key={w} value={w}>{w}</option>)}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Home address">
              <Input value={form.address} onChange={set("address")} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Employment</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Employment status" required>
            <Select value={form.employment_status} onChange={set("employment_status")}>
              {Object.entries(EMPLOYMENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </Field>
          <Field label="Highest education">
            <Select value={form.highest_education} onChange={set("highest_education")}>
              {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </Select>
          </Field>
          <Field label="Occupation">
            <Input value={form.occupation} onChange={set("occupation")} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Role & consent</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Role you're applying for" required error={errors.appliedRole}>
            <Select value={appliedRole} onChange={(e) => setAppliedRole(e.target.value)}>
              <option value="">Select a role…</option>
              {APPLICABLE_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </Select>
          </Field>
          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
            <input type="checkbox" checked={form.consent_given} onChange={set("consent_given")} className="mt-0.5 h-4 w-4 accent-[hsl(152,65%,22%)]" />
            <span>
              I consent to the collection and use of my data for the ADOZA Data Centre project.
              {errors.consent_given && <span className="block text-[11px] font-medium text-destructive">{errors.consent_given}</span>}
            </span>
          </label>
        </CardContent>
      </Card>

      {errors._root && <p className="text-sm font-medium text-destructive">{errors._root}</p>}

      <Button type="submit" className="w-full" loading={submit.isPending}>
        <Send className="h-4 w-4" /> Submit application
      </Button>
    </form>
  );
}

export default function StaffApplication() {
  const { session, user, loading: authLoading } = useAuth();
  const { data: application, isLoading, isError, refetch } = useMyStaffApplication(user?.id);
  const { data: youthRecord, isLoading: loadingYouth } = useMyYouthRecord(user?.id);

  if (authLoading) return <Spinner className="min-h-screen" />;
  if (!session) return <Navigate to="/login" replace />;

  return (
    <div className="mx-auto min-h-screen max-w-lg p-4 lg:p-8">
      <PortalHeader />
      {isLoading || loadingYouth ? (
        <Spinner />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : application ? (
        <ApplicationStatus application={application} />
      ) : youthRecord ? (
        <CandidateEmailBlockedCard />
      ) : (
        <ApplyForm user={user} />
      )}
    </div>
  );
}
