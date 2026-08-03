import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Save, Plus, Trash2, Camera, User } from "lucide-react";
import { useYouth, useSaveYouth, useSkills } from "@/hooks/useData";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button, Input, Select, Textarea, Field, Card, CardHeader, CardTitle, CardContent, Spinner } from "@/components/ui";
import { KOGI_LGAS, KOGI_WARDS_BY_LGA, EDUCATION_LEVELS, EMPLOYMENT_LABELS } from "@/lib/utils";

const EMPTY = {
  photo_url: "", first_name: "", last_name: "", gender: "male", date_of_birth: "", phone: "",
  email: "", address: "", ward: "", lga: "", occupation: "", highest_education: "Secondary",
  employment_status: "unemployed", monthly_income: "", business_name: "", business_address: "",
  government_id: "", latitude: "", longitude: "", consent_given: false,
  needs_training: false, needs_equipment: false, needs_funding: false,
};

export default function YouthForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: existing, isLoading: loadingYouth } = useYouth(id);
  const { data: skillsCatalogue = [] } = useSkills();
  const save = useSaveYouth();

  const [form, setForm] = useState(EMPTY);
  const [skillRows, setSkillRows] = useState([]);
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
    else if (!/^\+?[\d\s-]{10,15}$/.test(form.phone.trim())) e.phone = "Enter a valid phone number";
    if (!form.ward.trim()) e.ward = "Required";
    if (!form.lga) e.lga = "Required";
    if (!form.consent_given) e.consent_given = "Consent is required to register";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      ...form,
      photo_url: form.photo_url || null,
      email: form.email || null,
      occupation: form.occupation || null,
      business_name: form.business_name || null,
      business_address: form.business_address || null,
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

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Card className="animate-fade-up">
          <CardHeader><CardTitle>Photo</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-4">
            {form.photo_url ? (
              <img src={form.photo_url} alt="" className="h-16 w-16 rounded-lg object-cover" />
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
            <Field label="Latitude">
              <Input value={form.latitude} onChange={set("latitude")} inputMode="decimal" />
            </Field>
            <Field label="Longitude">
              <Input value={form.longitude} onChange={set("longitude")} inputMode="decimal" />
            </Field>
            <div className="sm:col-span-2 flex items-center gap-3">
              <Button type="button" variant="outline" size="sm" onClick={captureGps}>
                <MapPin className="h-4 w-4" /> Capture GPS
              </Button>
              {gpsStatus && <p className="text-xs text-muted-foreground">{gpsStatus}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up">
          <CardHeader><CardTitle>Employment &amp; business</CardTitle></CardHeader>
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

        {errors._root && <p className="text-sm font-medium text-destructive">{errors._root}</p>}

        <div className="flex justify-end gap-2 pb-8">
          <Link to={id ? `/youths/${id}` : "/youths"}>
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" loading={save.isPending}>
            <Save className="h-4 w-4" /> {id ? "Save changes" : "Register candidate"}
          </Button>
        </div>
      </form>
    </div>
  );
}
