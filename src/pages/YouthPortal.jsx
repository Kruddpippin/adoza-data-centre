import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { LogOut, Wrench, KeyRound, CheckCircle2, Landmark, Truck, CalendarClock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  useMyYouthRecord, useClaimYouthRecord, useSaveYouth, useSkills, useSaveBankDetails, useSaveDeliveryPreference,
} from "@/hooks/useData";
import {
  Button, Input, Select, Textarea, Field, Card, CardHeader, CardTitle, CardContent, Spinner, ErrorState, Badge,
} from "@/components/ui";
import {
  KOGI_LGAS, KOGI_WARDS_BY_LGA, EDUCATION_LEVELS, EMPLOYMENT_LABELS, VERIFICATION_META,
  NIGERIAN_BANKS, isValidNuban, DELIVERY_METHOD_LABELS, formatDate, cn,
} from "@/lib/utils";

function PasswordSettings() {
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
    <Card>
      <CardHeader><CardTitle>Sign in with a password</CardTitle></CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}

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
          <p className="text-[11px] text-muted-foreground">Candidate self-service portal</p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={signOut}>
        <LogOut className="h-4 w-4" /> Sign out
      </Button>
    </div>
  );
}

function BankDetailsForm({ youth }) {
  const existing = youth.youth_bank_details;
  const save = useSaveBankDetails();
  const [form, setForm] = useState({
    bank_code: existing?.bank_code ?? "",
    account_number: existing?.account_number ?? "",
    account_name: existing?.account_name ?? "",
    next_of_kin_name: existing?.next_of_kin_name ?? "",
    next_of_kin_phone: existing?.next_of_kin_phone ?? "",
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const set = (key) => (e) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const validate = () => {
    const e = {};
    if (!form.bank_code) e.bank_code = "Select your bank";
    if (!isValidNuban(form.account_number)) e.account_number = "Enter a valid 10-digit account number";
    if (!form.account_name.trim()) e.account_name = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaved(false);
    if (!validate()) return;
    const bank = NIGERIAN_BANKS.find((b) => b.code === form.bank_code);
    try {
      await save.mutateAsync({
        youth_id: youth.id,
        bank_code: form.bank_code,
        bank_name: bank?.name ?? "",
        account_number: form.account_number.trim(),
        account_name: form.account_name.trim(),
        next_of_kin_name: form.next_of_kin_name.trim() || null,
        next_of_kin_phone: form.next_of_kin_phone.trim() || null,
      });
      setSaved(true);
    } catch (err) {
      setErrors((prev) => ({ ...prev, _root: err.message }));
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Banking details</CardTitle></CardHeader>
      <CardContent>
        <p className="mb-3 text-xs text-muted-foreground">
          Needed to receive any funding or equipment allowance. These go straight to the programme's finance team.
        </p>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="Bank" required error={errors.bank_code}>
            <Select value={form.bank_code} onChange={set("bank_code")}>
              <option value="">Select your bank…</option>
              {NIGERIAN_BANKS.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
            </Select>
          </Field>
          <Field label="Account number" required error={errors.account_number} hint="10 digits, no spaces">
            <Input inputMode="numeric" maxLength={10} value={form.account_number} onChange={set("account_number")} placeholder="0123456789" />
          </Field>
          <Field label="Account name" required error={errors.account_name}>
            <Input value={form.account_name} onChange={set("account_name")} placeholder="As it appears on your bank account" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Next of kin name">
              <Input value={form.next_of_kin_name} onChange={set("next_of_kin_name")} />
            </Field>
            <Field label="Next of kin phone">
              <Input type="tel" value={form.next_of_kin_phone} onChange={set("next_of_kin_phone")} placeholder="+234…" />
            </Field>
          </div>
          {errors._root && <p className="text-sm font-medium text-destructive">{errors._root}</p>}
          {saved && !save.isPending && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" /> Saved.
            </p>
          )}
          <Button type="submit" className="w-full" loading={save.isPending}>
            <Landmark className="h-4 w-4" /> {existing ? "Update banking details" : "Save banking details"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function DeliveryPreferenceForm({ youth }) {
  const existing = youth.youth_delivery_preferences;
  const save = useSaveDeliveryPreference();
  const [method, setMethod] = useState(existing?.method ?? "home_address");
  const [address, setAddress] = useState(existing?.address ?? "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    if (method === "custom_address" && !address.trim()) {
      setError("Enter the delivery address");
      return;
    }
    try {
      await save.mutateAsync({
        youth_id: youth.id,
        method,
        address: method === "custom_address" ? address.trim() : null,
      });
      setSaved(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>How should we get this to you?</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="space-y-2">
            {Object.entries(DELIVERY_METHOD_LABELS).map(([key, label]) => (
              <label
                key={key}
                className={cn(
                  "flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-sm hover:bg-muted/50",
                  method === key && "border-primary bg-primary/5"
                )}
              >
                <input
                  type="radio"
                  name="delivery_method"
                  className="mt-0.5 h-4 w-4 accent-[hsl(152,65%,22%)]"
                  checked={method === key}
                  onChange={() => {
                    setMethod(key);
                    setSaved(false);
                  }}
                />
                <span>
                  {label}
                  {key === "home_address" && youth.address && (
                    <span className="block text-xs text-muted-foreground">{youth.address}</span>
                  )}
                  {key === "pickup_centre" && (
                    <span className="block text-xs text-muted-foreground">
                      We'll notify you when it's ready for collection at your local ADOZA empowerment centre.
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
          {method === "custom_address" && (
            <Field label="Delivery address" required error={error}>
              <Textarea rows={2} value={address} onChange={(e) => { setAddress(e.target.value); setSaved(false); }} />
            </Field>
          )}
          {method !== "custom_address" && error && <p className="text-sm font-medium text-destructive">{error}</p>}
          {saved && !save.isPending && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" /> Saved.
            </p>
          )}
          <Button type="submit" className="w-full" loading={save.isPending}>
            <Truck className="h-4 w-4" /> {existing ? "Update preference" : "Save preference"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function TrainingInfoCard({ youth }) {
  return (
    <Card className="border-accent/30 bg-accent/5">
      <CardHeader><CardTitle>Training commencement</CardTitle></CardHeader>
      <CardContent className="space-y-1.5 text-sm">
        <p className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-accent-foreground" aria-hidden />
          {youth.training_commencement_date ? formatDate(youth.training_commencement_date) : "Date to be announced"}
        </p>
        <p className="text-muted-foreground">{youth.training_venue || "Venue to be announced"}</p>
        {youth.training_notes && <p className="text-xs text-muted-foreground">{youth.training_notes}</p>}
      </CardContent>
    </Card>
  );
}

function StatusView({ youth }) {
  const meta = VERIFICATION_META[youth.verification_status];
  const showBankForm = youth.verification_status === "verified";
  const showDelivery = youth.is_approved_beneficiary && (youth.needs_funding || youth.needs_equipment);
  const showTraining = youth.is_approved_beneficiary && youth.needs_training;

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
            ? "Your registration has been verified by the programme team. You can now submit your banking details below."
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

      {showBankForm && <BankDetailsForm youth={youth} />}
      {showDelivery && <DeliveryPreferenceForm youth={youth} />}
      {showTraining && <TrainingInfoCard youth={youth} />}

      <PasswordSettings />
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
