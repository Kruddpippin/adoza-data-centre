import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { LogOut, Wrench } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  useMyYouthRecord, useClaimYouthRecord, useSaveYouth, useSkills,
} from "@/hooks/useData";
import {
  Button, Input, Select, Field, Card, CardHeader, CardTitle, CardContent, Spinner, ErrorState, Badge,
} from "@/components/ui";
import {
  KOGI_LGAS, KOGI_WARDS_BY_LGA, EDUCATION_LEVELS, EMPLOYMENT_LABELS, VERIFICATION_META,
} from "@/lib/utils";

function PortalHeader({ youth }) {
  const { signOut } = useAuth();
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <img src="/kogi-logo.png" alt="Kogi State Government" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
        <div>
          <p className="font-display text-sm font-bold tracking-tight">
            {youth ? `${youth.first_name} ${youth.last_name}` : "ADOZA Data Centre"}
          </p>
          <p className="text-[11px] text-muted-foreground">Youth self-service portal</p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={signOut}>
        <LogOut className="h-4 w-4" /> Sign out
      </Button>
    </div>
  );
}

function StatusView({ youth }) {
  const meta = VERIFICATION_META[youth.verification_status];

  return (
    <div className="space-y-4">
      <Card className="p-5 text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Welcome back</p>
        <h1 className="font-display mt-1 text-xl font-bold tracking-tight">{youth.first_name} {youth.last_name}</h1>
        <div className="mt-3 flex items-center justify-center gap-2">
          {meta && <Badge className={meta.cls}>{meta.label}</Badge>}
          {youth.is_approved_beneficiary && <Badge className="bg-accent/15 text-accent-foreground">Beneficiary</Badge>}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {youth.verification_status === "verified"
            ? "Your registration has been verified by the programme team."
            : youth.verification_status === "rejected"
              ? "Your registration could not be verified."
              : youth.verification_status === "flagged"
                ? "Your registration has been flagged for review."
                : "Your registration is awaiting review by the programme team."}
        </p>
      </Card>

      {youth.verification_notes && (
        <Card>
          <CardHeader><CardTitle>Note from the programme team</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{youth.verification_notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const EMPTY = {
  first_name: "", last_name: "", gender: "male", date_of_birth: "", phone: "",
  email: "", address: "", ward: "", lga: "", occupation: "", highest_education: "Secondary",
  employment_status: "unemployed", monthly_income: "", needs_training: false,
  needs_equipment: false, needs_funding: false, consent_given: false,
};

function SelfRegisterForm({ user }) {
  const { data: skillsCatalogue = [] } = useSkills();
  const save = useSaveYouth();
  const [form, setForm] = useState({ ...EMPTY, email: user?.email ?? "" });
  const [skillId, setSkillId] = useState("");
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
    if (!form.ward) e.ward = "Required";
    if (!form.lga) e.lga = "Required";
    if (!form.consent_given) e.consent_given = "Consent is required to register";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await save.mutateAsync({
        ...form,
        auth_user_id: user.id,
        monthly_income: form.monthly_income === "" ? null : Number(form.monthly_income),
        consent_date: new Date().toISOString(),
        skills: skillId ? [{ skill_id: skillId, is_primary: true }] : [],
      });
    } catch (err) {
      setErrors((prev) => ({ ...prev, _root: err.message }));
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Card>
        <CardHeader><CardTitle>Complete your registration</CardTitle></CardHeader>
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
            <Input type="email" value={form.email} onChange={set("email")} disabled />
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
        <CardHeader><CardTitle>Employment & skills</CardTitle></CardHeader>
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
          <Field label="Your main skill">
            <Select value={skillId} onChange={(e) => setSkillId(e.target.value)}>
              <option value="">Select a skill…</option>
              {skillsCatalogue.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Needs & consent</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-3">
            {[["needs_training", "Needs training"], ["needs_equipment", "Needs equipment"], ["needs_funding", "Needs funding"]].map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm hover:bg-muted/50">
                <input type="checkbox" checked={form[key]} onChange={set(key)} className="h-4 w-4 accent-[hsl(152,65%,22%)]" />
                {label}
              </label>
            ))}
          </div>
          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
            <input type="checkbox" checked={form.consent_given} onChange={set("consent_given")} className="mt-0.5 h-4 w-4 accent-[hsl(152,65%,22%)]" />
            <span>
              I give my informed consent for my data to be collected and used for the ADOZA empowerment programme.
              {errors.consent_given && <span className="block text-[11px] font-medium text-destructive">{errors.consent_given}</span>}
            </span>
          </label>
        </CardContent>
      </Card>

      {errors._root && <p className="text-sm font-medium text-destructive">{errors._root}</p>}

      <Button type="submit" className="w-full" loading={save.isPending}>
        <Wrench className="h-4 w-4" /> Submit registration
      </Button>
    </form>
  );
}

export default function YouthPortal() {
  const { session, user, loading: authLoading } = useAuth();
  const { data: record, isLoading, isError, refetch } = useMyYouthRecord(user?.id);
  const claim = useClaimYouthRecord();

  useEffect(() => {
    if (record && !record.auth_user_id && user?.id && !claim.isPending) {
      claim.mutate({ id: record.id, userId: user.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.id, record?.auth_user_id, user?.id]);

  if (authLoading) return <Spinner className="min-h-screen" />;
  if (!session) return <Navigate to="/login" replace />;

  return (
    <div className="mx-auto min-h-screen max-w-2xl p-4 lg:p-8">
      <PortalHeader youth={record} />
      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : record ? (
        <StatusView youth={record} />
      ) : (
        <SelfRegisterForm user={user} />
      )}
    </div>
  );
}
