import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft, MapPin, Save, Plus, Trash2, User, Flag, GraduationCap, ClipboardCheck,
} from "lucide-react";
import { useYouth, useSaveYouth, useSkills } from "@/hooks/useData";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button, Input, Select, Textarea, Field, Card, CardHeader, CardTitle, CardContent, Spinner } from "@/components/ui";
import { Stepper } from "@/components/Stepper";
import { WebcamCaptureButton } from "@/components/WebcamCapture";
import { usePersistedState } from "@/hooks/usePersistedState";
import {
  KOGI_LGAS, KOGI_WARDS_BY_LGA, EDUCATION_LEVELS, EMPLOYMENT_LABELS, ID_TYPES, ID_FORMATS,
  isValidGovernmentId, isAdminRole, isPlausibleNigeriaCoordinate,
} from "@/lib/utils";

const EMPTY = {
  photo_url: "", first_name: "", last_name: "", gender: "male", date_of_birth: "", phone: "",
  email: "", address: "", ward: "", lga: "", occupation: "", highest_education: "Secondary",
  employment_status: "unemployed", monthly_income: "", business_name: "", business_address: "",
  government_id_type: "", government_id: "", latitude: "", longitude: "", consent_given: false,
  needs_training: false, needs_equipment: false, needs_funding: false,
};

const STEPS = [
  { title: "Personal Details", icon: User },
  { title: "Location", icon: MapPin },
  { title: "Citizenship Identification", icon: Flag },
  { title: "Education & Employment", icon: GraduationCap },
  { title: "Skills & Consent", icon: ClipboardCheck },
];

export default function YouthForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { data: existing, isLoading: loadingYouth } = useYouth(id);
  const { data: skillsCatalogue = [] } = useSkills();
  const save = useSaveYouth();

  // Only persisted for a brand-new registration, not an edit — an edit's form state
  // comes from the server (via the effect below), so a stale draft would be wrong there.
  // Keyed by the enumerator's own id so a draft never leaks to a different staff member.
  const draftKey = id ? null : `adoza-draft-youth-form-${user.id}`;
  const [step, setStep, clearStepDraft] = usePersistedState(draftKey && `${draftKey}-step`, 0);
  const [form, setForm, clearFormDraft] = usePersistedState(draftKey && `${draftKey}-form`, EMPTY);
  const [skillRows, setSkillRows, clearSkillsDraft] = usePersistedState(draftKey && `${draftKey}-skills`, []);
  const [errors, setErrors] = useState({});
  const [gpsStatus, setGpsStatus] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  useEffect(() => {
    if (existing && id) {
      setForm({
        ...EMPTY,
        ...Object.fromEntries(Object.entries(existing).filter(([k]) => k in EMPTY).map(([k, v]) => [k, v ?? ""])),
        consent_given: !!existing.consent_given,
        needs_training: !!existing.needs_training,
        needs_equipment: !!existing.needs_equipment,
        needs_funding: !!existing.needs_funding,
      });
      setSkillRows(
        (existing.youth_skills ?? []).map((ys) => ({
          skill_id: ys.skill?.id,
          years_of_experience: ys.years_of_experience ?? "",
          proficiency: ys.proficiency ?? "",
          is_primary: ys.is_primary,
        }))
      );
    }
  }, [existing, id]);

  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const setLga = (e) => {
    const lga = e.target.value;
    setForm((f) => ({ ...f, lga, ward: (KOGI_WARDS_BY_LGA[lga] ?? []).includes(f.ward) ? f.ward : "" }));
  };

  const wardOptions = KOGI_WARDS_BY_LGA[form.lga] ?? [];

  // Only retakes of an already-saved photo count against the cap — the very first save
  // (whether at registration or a later first upload) is free. Admins are exempt, same
  // as the database-side enforcement, so they can still fix a bad photo after the cap.
  const photoRetakesUsed = id ? (existing?.photo_update_count ?? 0) : 0;
  const photoLocked = !!id && !!existing?.photo_url && photoRetakesUsed >= 2 && !isAdminRole(role);

  const captureGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus("Geolocation not supported on this device.");
      return;
    }
    setGpsStatus("Locating…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        // A device/network fix can be off by kilometers, but never continents — a result
        // outside Nigeria is a bad reading, not a real registration location.
        if (!isPlausibleNigeriaCoordinate(latitude, longitude)) {
          setGpsStatus("That location doesn't look right — try again with a clearer GPS signal, ideally outdoors.");
          return;
        }
        setForm((f) => ({
          ...f,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        }));
        setGpsStatus(`Captured (±${Math.round(accuracy)}m)`);
      },
      () => setGpsStatus("Could not get location — check permissions."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePhotoCapture = async (blob) => {
    setPhotoError("");
    setPhotoUploading(true);
    try {
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const { error } = await supabase.storage.from("youth-photos").upload(path, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      const { data } = supabase.storage.from("youth-photos").getPublicUrl(path);
      setForm((f) => ({ ...f, photo_url: data.publicUrl }));
    } catch (err) {
      setPhotoError(err.message);
    } finally {
      setPhotoUploading(false);
    }
  };

  const validateStep = (i) => {
    const e = {};
    if (i === 0) {
      if (!form.first_name.trim()) e.first_name = "Required";
      if (!form.last_name.trim()) e.last_name = "Required";
      if (!form.date_of_birth) e.date_of_birth = "Required";
      if (!form.phone.trim()) e.phone = "Required";
      else if (!/^\+?[\d\s-]{10,15}$/.test(form.phone.trim())) e.phone = "Enter a valid phone number";
    }
    if (i === 1) {
      if (!form.ward.trim()) e.ward = "Required";
      if (!form.lga) e.lga = "Required";
      // GPS is captured device-side only now (no more manual entry boxes to mistype or
      // paste garbage into). Required for a brand-new registration; an edit of an existing
      // record is left alone — the enumerator fixing an unrelated field may not be on-site
      // to recapture it, and can still use the Capture GPS button if they want to update it.
      if (!id) {
        if (!form.latitude.trim() || !form.longitude.trim()) {
          e.longitude = "Tap Capture GPS to record the candidate's location";
        } else if (!isPlausibleNigeriaCoordinate(form.latitude, form.longitude)) {
          e.longitude = "Doesn't look like a valid Nigeria location — try Capture GPS again";
        }
      } else if ((form.latitude.trim() || form.longitude.trim()) && !isPlausibleNigeriaCoordinate(form.latitude, form.longitude)) {
        e.longitude = "Doesn't look like a valid Nigeria location — try Capture GPS again";
      }
    }
    if (i === 2) {
      if (form.government_id.trim() && !form.government_id_type) {
        e.government_id_type = "Select the ID type first";
      } else if (form.government_id.trim() && !isValidGovernmentId(form.government_id_type, form.government_id)) {
        const label = ID_TYPES.find((t) => t.value === form.government_id_type)?.label ?? "ID number";
        e.government_id = `Doesn't look like a valid ${label} — expected ${ID_FORMATS[form.government_id_type]?.hint}`;
      }
    }
    if (i === 4) {
      if (!form.consent_given) e.consent_given = "Consent is required to register";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    // Guard every step, in case an earlier one was skipped past (e.g. browser back/forward).
    for (let i = 0; i < STEPS.length; i++) {
      if (!validateStep(i)) {
        setStep(i);
        return;
      }
    }
    const payload = {
      ...form,
      photo_url: form.photo_url || null,
      email: form.email || null,
      occupation: form.occupation || null,
      business_name: form.business_name || null,
      business_address: form.business_address || null,
      government_id_type: form.government_id_type || null,
      government_id: form.government_id || null,
      monthly_income: form.monthly_income === "" ? null : Number(form.monthly_income),
      latitude: form.latitude === "" ? null : Number(form.latitude),
      longitude: form.longitude === "" ? null : Number(form.longitude),
      consent_date: form.consent_given ? new Date().toISOString() : null,
      skills: skillRows.filter((s) => s.skill_id),
    };
    if (!id) payload.created_by = user.id;
    try {
      const saved = await save.mutateAsync(id ? { id, ...payload } : payload);
      if (!id) {
        clearFormDraft();
        clearSkillsDraft();
        clearStepDraft();
      }
      navigate(`/youths/${saved.id}`);
    } catch (err) {
      setErrors((prev) => ({ ...prev, _root: err.message }));
    }
  };

  if (id && loadingYouth) return <Spinner />;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="animate-fade-up">
        <Link to={id ? `/youths/${id}` : "/youths"} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
        <h1 className="font-display mt-1 text-xl font-bold tracking-tight lg:text-2xl">
          {id ? "Edit candidate record" : "Register a candidate"}
        </h1>
      </div>

      <Stepper steps={STEPS} currentStep={step} />

      <form onSubmit={submit} className="space-y-4" noValidate>
        {step === 0 && (
          <>
            <Card className="animate-fade-up">
              <CardHeader><CardTitle>Photo</CardTitle></CardHeader>
              <CardContent className="flex items-center gap-4">
                {form.photo_url ? (
                  <img
                    src={form.photo_url}
                    alt={form.first_name ? `${form.first_name} ${form.last_name}` : "Candidate photo preview"}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                    <User className="h-6 w-6 text-muted-foreground" aria-hidden />
                  </div>
                )}
                <div className="space-y-1.5">
                  {photoLocked ? (
                    <p className="text-xs font-medium text-muted-foreground">
                      Photo retake limit reached (2/2). Only an admin can change it now.
                    </p>
                  ) : (
                    <>
                      <WebcamCaptureButton
                        label={form.photo_url ? "Retake photo" : "Take photo"}
                        facingMode="environment"
                        onCapture={handlePhotoCapture}
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Live camera only — uploading an existing photo isn't allowed, to prevent duplicate registrations.
                        {id && existing?.photo_url && !isAdminRole(role) && ` ${Math.max(0, 2 - photoRetakesUsed)} retake${2 - photoRetakesUsed === 1 ? "" : "s"} left.`}
                      </p>
                    </>
                  )}
                  {photoUploading && <p className="text-xs text-muted-foreground">Uploading…</p>}
                  {photoError && <p className="text-xs text-destructive">{photoError}</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-up">
              <CardHeader><CardTitle>Personal details</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" required error={errors.first_name}>
                  <Input value={form.first_name} onChange={set("first_name")} autoComplete="given-name" />
                </Field>
                <Field label="Last name" required error={errors.last_name}>
                  <Input value={form.last_name} onChange={set("last_name")} autoComplete="family-name" />
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
                  <Input type="tel" value={form.phone} onChange={set("phone")} placeholder="+234…" autoComplete="tel" />
                </Field>
                <Field label="Email">
                  <Input type="email" value={form.email} onChange={set("email")} autoComplete="email" />
                </Field>
              </CardContent>
            </Card>
          </>
        )}

        {step === 1 && (
          <Card className="animate-fade-up">
            <CardHeader><CardTitle>Location</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Home address">
                  <Textarea rows={2} value={form.address} onChange={set("address")} autoComplete="street-address" />
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
              <div className="sm:col-span-2">
                <Field label="GPS location" required={!id} error={errors.longitude}>
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" size="sm" onClick={captureGps}>
                      <MapPin className="h-4 w-4" /> Capture GPS
                    </Button>
                    {gpsStatus && <p className="text-xs text-muted-foreground">{gpsStatus}</p>}
                  </div>
                </Field>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="animate-fade-up">
            <CardHeader><CardTitle>Citizenship Identification</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Means of Identification" error={errors.government_id_type}>
                <Select value={form.government_id_type} onChange={set("government_id_type")}>
                  <option value="">Select Identification…</option>
                  {ID_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </Select>
              </Field>
              <Field
                label="Document Number"
                error={errors.government_id}
                hint={form.government_id_type ? ID_FORMATS[form.government_id_type]?.hint : undefined}
              >
                <Input value={form.government_id} onChange={set("government_id")} placeholder="Document Number" />
              </Field>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="animate-fade-up">
            <CardHeader><CardTitle>Education &amp; employment</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Highest education">
                <Select value={form.highest_education} onChange={set("highest_education")}>
                  {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </Select>
              </Field>
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
        )}

        {step === 4 && (
          <>
            <Card className="animate-fade-up">
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

            <Card className="animate-fade-up">
              <CardHeader><CardTitle>Needs &amp; consent</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    ["needs_training", "Needs training"],
                    ["needs_equipment", "Needs equipment"],
                    ["needs_funding", "Needs funding"],
                  ].map(([key, label]) => (
                    <label key={key} className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm hover:bg-muted/50">
                      <input type="checkbox" checked={form[key]} onChange={set(key)} className="h-4 w-4 accent-[hsl(152,65%,22%)]" />
                      {label}
                    </label>
                  ))}
                </div>
                <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
                  <input type="checkbox" checked={form.consent_given} onChange={set("consent_given")} className="mt-0.5 h-4 w-4 accent-[hsl(152,65%,22%)]" />
                  <span>
                    The candidate has given informed consent for their data to be collected and used for the ADOZA empowerment programme.
                    {errors.consent_given && <span className="block text-[11px] font-medium text-destructive">{errors.consent_given}</span>}
                  </span>
                </label>
              </CardContent>
            </Card>
          </>
        )}

        {errors._root && <p className="text-sm font-medium text-destructive">{errors._root}</p>}

        <div className="flex justify-between gap-2 pb-8">
          {step === 0 ? (
            <Link to={id ? `/youths/${id}` : "/youths"}>
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          ) : (
            <Button type="button" variant="outline" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={goNext}>Next</Button>
          ) : (
            <Button type="submit" loading={save.isPending}>
              <Save className="h-4 w-4" /> {id ? "Save changes" : "Register candidate"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
