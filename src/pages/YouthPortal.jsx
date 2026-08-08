import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  LogOut, Wrench, KeyRound, CheckCircle2, Circle, Landmark, Truck, CalendarClock,
  Phone, Mail, MapPin, GraduationCap, Briefcase, ShieldCheck, Plus, Trash2, Camera, User, AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  useMyYouthRecord, useClaimYouthRecord, useSaveYouth, useSkills, useSaveBankDetails, useSaveDeliveryPreference,
} from "@/hooks/useData";
import {
  Button, Input, Select, Textarea, Field, Card, CardHeader, CardTitle, CardContent, Spinner, ErrorState, Badge, Modal,
} from "@/components/ui";
import { NotificationsBell, useDropdown } from "@/components/NotificationsBell";
import { PasswordSettingsForm } from "@/components/PasswordSettingsForm";
import {
  KOGI_LGAS, KOGI_WARDS_BY_LGA, EDUCATION_LEVELS, EMPLOYMENT_LABELS, VERIFICATION_META,
  NIGERIAN_BANKS, isValidNuban, DELIVERY_METHOD_LABELS, formatDate, formatNaira, initialsOf, cn,
} from "@/lib/utils";

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm">{value || "—"}</p>
      </div>
    </div>
  );
}

function PortalHeader({ youth }) {
  const { session, signOut } = useAuth();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const menu = useDropdown();
  const initials = initialsOf(youth ? `${youth.first_name} ${youth.last_name}` : "");

  const canUpdateBank = !!youth?.youth_bank_details;
  const canUpdateDelivery = !!youth?.youth_delivery_preferences;

  return (
    <div className="mb-6 flex items-center justify-between">
      <Link to={session ? "/my-registration" : "/login"} className="flex items-center gap-2.5">
        <img src="/kogi-logo.png" alt="Kogi State Government" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
        <div>
          <p className="font-display text-sm font-bold tracking-tight">
            {youth ? `${youth.first_name} ${youth.last_name}` : "ADOZA Data Centre"}
          </p>
          <p className="text-[11px] text-muted-foreground">Candidate Dashboard</p>
        </div>
      </Link>

      <div className="flex items-center gap-1">
      <NotificationsBell />
      <div ref={menu.ref} className="relative">
        <button
          onClick={() => menu.setOpen(!menu.open)}
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary text-[11px] font-semibold text-primary-foreground hover:opacity-90"
          aria-label="Profile menu"
          aria-expanded={menu.open}
        >
          {youth?.photo_url ? (
            <img src={youth.photo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            initials || "U"
          )}
        </button>
        {menu.open && (
          <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border bg-card p-1.5 shadow-lg" role="menu">
            <button
              role="menuitem"
              onClick={() => {
                setPhotoModalOpen(true);
                menu.setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-muted"
            >
              <Camera className="h-4 w-4" /> {youth?.photo_url ? "Update photo" : "Add photo"}
            </button>
            <button
              role="menuitem"
              onClick={() => {
                setPasswordModalOpen(true);
                menu.setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-muted"
            >
              <KeyRound className="h-4 w-4" /> Password settings
            </button>
            {canUpdateBank && (
              <button
                role="menuitem"
                onClick={() => {
                  setBankModalOpen(true);
                  menu.setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-muted"
              >
                <Landmark className="h-4 w-4" /> Update bank details
              </button>
            )}
            {canUpdateDelivery && (
              <button
                role="menuitem"
                onClick={() => {
                  setDeliveryModalOpen(true);
                  menu.setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-muted"
              >
                <Truck className="h-4 w-4" /> Update delivery details
              </button>
            )}
            <div className="my-1 border-t" />
            <button
              role="menuitem"
              onClick={signOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        )}
      </div>
      </div>

      <Modal open={photoModalOpen} onClose={() => setPhotoModalOpen(false)} title={youth?.photo_url ? "Update photo" : "Add photo"}>
        <PhotoUpdateForm youth={youth} onDone={() => setPhotoModalOpen(false)} />
      </Modal>
      <Modal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} title="Password settings">
        <PasswordSettingsForm />
      </Modal>
      {canUpdateBank && (
        <Modal open={bankModalOpen} onClose={() => setBankModalOpen(false)} title="Update bank details">
          <BankDetailsForm youth={youth} />
        </Modal>
      )}
      {canUpdateDelivery && (
        <Modal open={deliveryModalOpen} onClose={() => setDeliveryModalOpen(false)} title="Update delivery details">
          <DeliveryPreferenceForm youth={youth} />
        </Modal>
      )}
    </div>
  );
}

function PhotoUpdateForm({ youth, onDone }) {
  const save = useSaveYouth();
  const [preview, setPreview] = useState(youth?.photo_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const { error: uploadError } = await supabase.storage.from("youth-photos").upload(path, file, { contentType: file.type || "image/jpeg" });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("youth-photos").getPublicUrl(path);
      await save.mutateAsync({ id: youth.id, photo_url: data.publicUrl });
      setPreview(data.publicUrl);
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {preview ? (
        <img src={preview} alt="" className="h-16 w-16 rounded-lg object-cover" />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
          <User className="h-6 w-6 text-muted-foreground" aria-hidden />
        </div>
      )}
      <div className="space-y-1.5">
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted">
          <Camera className="h-4 w-4" />
          {preview ? "Retake photo" : "Take / upload photo"}
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} disabled={uploading} />
        </label>
        {uploading && <p className="text-xs text-muted-foreground">Uploading…</p>}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
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
    <div>
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
    </div>
  );
}

function BankDetailsSummary({ bank }) {
  return (
    <Card>
      <CardHeader><CardTitle>Banking details</CardTitle></CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <InfoRow icon={Landmark} label="Bank" value={bank.bank_name} />
        <InfoRow icon={Landmark} label="Account number" value={bank.account_number} />
        <InfoRow icon={Landmark} label="Account name" value={bank.account_name} />
        {(bank.next_of_kin_name || bank.next_of_kin_phone) && (
          <InfoRow
            icon={Phone}
            label="Next of kin"
            value={[bank.next_of_kin_name, bank.next_of_kin_phone].filter(Boolean).join(" — ")}
          />
        )}
        <p className="text-[11px] text-muted-foreground sm:col-span-2">
          To change these, use "Update bank details" from the profile menu.
        </p>
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
    <div>
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
    </div>
  );
}

function DeliveryPreferenceSummary({ preference }) {
  return (
    <Card>
      <CardHeader><CardTitle>Delivery preference</CardTitle></CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <InfoRow icon={Truck} label="Method" value={DELIVERY_METHOD_LABELS[preference.method] ?? preference.method} />
        {preference.address && <InfoRow icon={MapPin} label="Address" value={preference.address} />}
        <p className="text-[11px] text-muted-foreground sm:col-span-2">
          To change this, use "Update delivery details" from the profile menu.
        </p>
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

function JourneyProgress({ youth }) {
  if (youth.verification_status === "rejected" || youth.verification_status === "flagged") return null;

  const steps = [
    { label: "Verified", done: youth.verification_status === "verified" },
    { label: "Approved beneficiary", done: youth.is_approved_beneficiary },
  ];

  return (
    <Card>
      <CardHeader><CardTitle>Your journey</CardTitle></CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {steps.map((step) => (
            <li key={step.label} className="flex items-center gap-2.5">
              {step.done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              )}
              <span className={cn("text-sm", step.done ? "font-medium" : "text-muted-foreground")}>{step.label}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function RegistrationSummaryCard({ youth }) {
  const needs = [["Training", youth.needs_training], ["Equipment", youth.needs_equipment], ["Funding", youth.needs_funding]].filter(
    ([, val]) => val
  );

  return (
    <Card>
      <CardHeader><CardTitle>Your registration details</CardTitle></CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <InfoRow icon={Phone} label="Phone" value={youth.phone} />
        <InfoRow icon={Mail} label="Email" value={youth.email} />
        <InfoRow icon={MapPin} label="Address" value={youth.address} />
        <InfoRow icon={MapPin} label="Ward / LGA" value={`${youth.ward}, ${youth.lga}`} />
        <InfoRow icon={GraduationCap} label="Education" value={youth.highest_education} />
        <InfoRow
          icon={Briefcase}
          label="Employment"
          value={`${EMPLOYMENT_LABELS[youth.employment_status] ?? "—"}${youth.occupation ? ` — ${youth.occupation}` : ""}`}
        />
        <InfoRow icon={Briefcase} label="Monthly income" value={formatNaira(youth.monthly_income)} />
        <InfoRow icon={Briefcase} label="Business" value={youth.business_name} />
        <InfoRow icon={ShieldCheck} label="Government ID" value={youth.government_id} />
        <InfoRow icon={ShieldCheck} label="Consent" value={youth.consent_given ? `Given ${formatDate(youth.consent_date)}` : "Not given"} />
        <div className="sm:col-span-2">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">What you told us you need</p>
          {needs.length ? (
            <div className="flex flex-wrap gap-1.5">
              {needs.map(([label]) => (
                <Badge key={label} className="bg-accent/15 text-accent-foreground">{label}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">None selected.</p>
          )}
        </div>
        {youth.youth_skills?.length > 0 && (
          <div className="sm:col-span-2">
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {youth.youth_skills.map((ys) => (
                <Badge key={ys.id} className="bg-primary/10 text-primary">
                  {ys.skill?.name}
                  {ys.is_primary ? " · Primary" : ""}
                </Badge>
              ))}
            </div>
          </div>
        )}
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
        {youth.photo_url && (
          <img
            src={youth.photo_url}
            alt={`${youth.first_name} ${youth.last_name}`}
            className="mx-auto h-20 w-20 rounded-full border-2 border-card object-cover shadow-sm"
          />
        )}
        <p className={cn("text-xs font-medium uppercase tracking-wider text-muted-foreground", youth.photo_url ? "mt-3" : "")}>Welcome back</p>
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

      <JourneyProgress youth={youth} />

      {youth.verification_notes && (
        <Card>
          <CardHeader><CardTitle>Note from the programme team</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{youth.verification_notes}</p>
          </CardContent>
        </Card>
      )}

      <RegistrationSummaryCard youth={youth} />

      {showBankForm &&
        (youth.youth_bank_details ? (
          <BankDetailsSummary bank={youth.youth_bank_details} />
        ) : (
          <Card>
            <CardHeader><CardTitle>Banking details</CardTitle></CardHeader>
            <CardContent>
              <BankDetailsForm youth={youth} />
            </CardContent>
          </Card>
        ))}

      {showDelivery &&
        (youth.youth_delivery_preferences ? (
          <DeliveryPreferenceSummary preference={youth.youth_delivery_preferences} />
        ) : (
          <Card>
            <CardHeader><CardTitle>How should we get this to you?</CardTitle></CardHeader>
            <CardContent>
              <DeliveryPreferenceForm youth={youth} />
            </CardContent>
          </Card>
        ))}

      {showTraining && <TrainingInfoCard youth={youth} />}
    </div>
  );
}

const EMPTY = {
  photo_url: "", first_name: "", last_name: "", gender: "male", date_of_birth: "", phone: "",
  email: "", address: "", ward: "", lga: "", occupation: "", highest_education: "Secondary",
  employment_status: "unemployed", monthly_income: "", business_name: "", business_address: "",
  government_id: "", latitude: "", longitude: "", needs_training: false,
  needs_equipment: false, needs_funding: false, consent_given: false,
};

function SelfRegisterForm({ user }) {
  const { data: skillsCatalogue = [] } = useSkills();
  const save = useSaveYouth();
  const [form, setForm] = useState({ ...EMPTY, email: user?.email ?? "" });
  const [skillRows, setSkillRows] = useState([]);
  const [errors, setErrors] = useState({});
  const [gpsStatus, setGpsStatus] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const setLga = (e) => {
    const lga = e.target.value;
    setForm((f) => ({ ...f, lga, ward: (KOGI_WARDS_BY_LGA[lga] ?? []).includes(f.ward) ? f.ward : "" }));
  };

  const wardOptions = KOGI_WARDS_BY_LGA[form.lga] ?? [];

  const captureGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus("Geolocation not supported on this device.");
      return;
    }
    setGpsStatus("Locating…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setGpsStatus(`Captured (±${Math.round(pos.coords.accuracy)}m)`);
      },
      () => setGpsStatus("Could not get location — check permissions."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoError("");
    setPhotoUploading(true);
    try {
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const { error } = await supabase.storage.from("youth-photos").upload(path, file, { contentType: file.type || "image/jpeg" });
      if (error) throw error;
      const { data } = supabase.storage.from("youth-photos").getPublicUrl(path);
      setForm((f) => ({ ...f, photo_url: data.publicUrl }));
    } catch (err) {
      setPhotoError(err.message);
    } finally {
      setPhotoUploading(false);
    }
  };

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
        photo_url: form.photo_url || null,
        occupation: form.occupation || null,
        business_name: form.business_name || null,
        business_address: form.business_address || null,
        government_id: form.government_id || null,
        monthly_income: form.monthly_income === "" ? null : Number(form.monthly_income),
        latitude: form.latitude === "" ? null : Number(form.latitude),
        longitude: form.longitude === "" ? null : Number(form.longitude),
        consent_date: new Date().toISOString(),
        skills: skillRows.filter((s) => s.skill_id),
      });
    } catch (err) {
      setErrors((prev) => ({ ...prev, _root: err.message }));
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Card>
        <CardHeader><CardTitle>Photo</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-4">
          {form.photo_url ? (
            <img
              src={form.photo_url}
              alt={form.first_name ? `${form.first_name} ${form.last_name}` : "Your photo preview"}
              className="h-16 w-16 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
              <User className="h-6 w-6 text-muted-foreground" aria-hidden />
            </div>
          )}
          <div className="space-y-1.5">
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted">
              <Camera className="h-4 w-4" />
              {form.photo_url ? "Retake photo" : "Take / upload photo"}
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} disabled={photoUploading} />
            </label>
            {photoUploading && <p className="text-xs text-muted-foreground">Uploading…</p>}
            {photoError && <p className="text-xs text-destructive">{photoError}</p>}
          </div>
        </CardContent>
      </Card>

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
            <Input type="email" value={form.email} onChange={set("email")} disabled />
          </Field>
          <Field label="Government ID (NIN / voter card)">
            <Input value={form.government_id} onChange={set("government_id")} />
          </Field>
          <Field label="Highest education">
            <Select value={form.highest_education} onChange={set("highest_education")}>
              {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Location</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Home address">
              <Textarea rows={2} value={form.address} onChange={set("address")} />
            </Field>
          </div>
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
          <Field label="Latitude">
            <Input value={form.latitude} onChange={set("latitude")} inputMode="decimal" />
          </Field>
          <Field label="Longitude">
            <Input value={form.longitude} onChange={set("longitude")} inputMode="decimal" />
          </Field>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Button type="button" variant="outline" size="sm" onClick={captureGps}>
              <MapPin className="h-4 w-4" /> Capture GPS
            </Button>
            {gpsStatus && <p className="text-xs text-muted-foreground">{gpsStatus}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Employment & business</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Employment status" required>
            <Select value={form.employment_status} onChange={set("employment_status")}>
              {Object.entries(EMPLOYMENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </Field>
          <Field label="Occupation">
            <Input value={form.occupation} onChange={set("occupation")} />
          </Field>
          <Field label="Monthly income (NGN)">
            <Input type="number" min="0" value={form.monthly_income} onChange={set("monthly_income")} />
          </Field>
          <Field label="Business name">
            <Input value={form.business_name} onChange={set("business_name")} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Business address">
              <Input value={form.business_address} onChange={set("business_address")} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {skillRows.map((row, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_110px_140px_44px]">
              <Select
                value={row.skill_id ?? ""}
                onChange={(e) => setSkillRows((rows) => rows.map((r, j) => (j === i ? { ...r, skill_id: e.target.value } : r)))}
                aria-label="Skill"
              >
                <option value="">Select skill…</option>
                {skillsCatalogue.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
              <Input
                type="number" min="0" max="50" placeholder="Years"
                value={row.years_of_experience}
                onChange={(e) => setSkillRows((rows) => rows.map((r, j) => (j === i ? { ...r, years_of_experience: e.target.value } : r)))}
                aria-label="Years of experience"
              />
              <Select
                value={row.proficiency}
                onChange={(e) => setSkillRows((rows) => rows.map((r, j) => (j === i ? { ...r, proficiency: e.target.value } : r)))}
                aria-label="Proficiency"
              >
                <option value="">Proficiency…</option>
                {["beginner", "intermediate", "advanced", "expert"].map((p) => (
                  <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>
                ))}
              </Select>
              <Button type="button" variant="ghost" size="icon" aria-label="Remove skill"
                onClick={() => setSkillRows((rows) => rows.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm"
            onClick={() => setSkillRows((rows) => [...rows, { skill_id: "", years_of_experience: "", proficiency: "", is_primary: rows.length === 0 }])}>
            <Plus className="h-4 w-4" /> Add skill
          </Button>
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

function StaffEmailBlockedCard() {
  const { signOut } = useAuth();
  return (
    <Card className="p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden />
      </div>
      <p className="mt-3 text-sm font-semibold">This email is already a staff account</p>
      <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
        Staff and candidates must use different email addresses. Sign out and register as a candidate using a different email.
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={signOut}>
        <LogOut className="h-4 w-4" /> Sign out
      </Button>
    </Card>
  );
}

export default function YouthPortal() {
  const { session, user, profile, loading: authLoading, profileLoading } = useAuth();
  const { data: record, isLoading, isError, refetch } = useMyYouthRecord(user?.id);
  const claim = useClaimYouthRecord();

  useEffect(() => {
    if (record && !record.auth_user_id && user?.id && !claim.isPending) {
      claim.mutate({ id: record.id, userId: user.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.id, record?.auth_user_id, user?.id]);

  if (authLoading) return <Spinner className="min-h-screen" />;
  // This portal is candidate-only — a lost session (including "Sign out" above)
  // returns to the candidate login, never the staff one.
  if (!session) return <Navigate to="/login?portal=candidate" replace />;

  return (
    <div className="mx-auto min-h-screen max-w-2xl p-4 lg:p-8">
      <PortalHeader youth={record} />
      {isLoading || profileLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : record ? (
        <StatusView youth={record} />
      ) : profile ? (
        <StaffEmailBlockedCard />
      ) : (
        <SelfRegisterForm user={user} />
      )}
    </div>
  );
}
