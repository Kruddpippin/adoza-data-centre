import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { Image, Platform, Pressable, ScrollView, Text, View } from "react-native";

import { useAuth } from "@/context/AuthContext";
import { useSaveYouth, useSkills, useYouth } from "@/hooks/useData";
import { usePersistedState } from "@/hooks/usePersistedState";
import { supabase } from "@/lib/supabase";
import { Button, Card, Field, Input, Spinner } from "@/components/ui";
import { SelectField } from "@/components/select-modal";
import { EDUCATION_LEVELS, EMPLOYMENT_LABELS, ID_TYPES, KOGI_LGAS, KOGI_WARDS_BY_LGA, isAdminRole } from "@/lib/utils";

const EMPTY = {
  photo_url: "",
  first_name: "",
  last_name: "",
  gender: "male",
  date_of_birth: "",
  phone: "",
  email: "",
  address: "",
  ward: "",
  lga: "",
  occupation: "",
  highest_education: "Secondary",
  employment_status: "unemployed",
  monthly_income: "",
  business_name: "",
  business_address: "",
  government_id_type: "",
  government_id: "",
  latitude: "",
  longitude: "",
  consent_given: false,
  needs_training: false,
  needs_equipment: false,
  needs_funding: false,
};

type SkillRow = { skill_id: string; years_of_experience: string; proficiency: string; is_primary: boolean };

function Checkbox({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <Pressable onPress={onToggle} className="flex-row items-center gap-2.5 rounded-lg border border-border p-3">
      <View className={`h-5 w-5 items-center justify-center rounded ${checked ? "bg-primary" : "border border-input bg-card"}`}>
        {checked ? <Ionicons name="checkmark" size={14} color="white" /> : null}
      </View>
      <Text className="flex-1 text-sm text-foreground">{label}</Text>
    </Pressable>
  );
}

export function YouthForm({ youthId }: { youthId?: string }) {
  const router = useRouter();
  const { user, role } = useAuth();
  const { data: existing, isLoading: loadingYouth } = useYouth(youthId);
  const { data: skillsCatalogue = [] } = useSkills();
  const save = useSaveYouth();

  // Only persisted for a brand-new registration, not an edit — an edit's form state
  // comes from the server (via the effect below), so a stale draft would be wrong there.
  // Keyed by the enumerator's own id so a draft never leaks to a different staff member.
  const draftKey = youthId ? null : `adoza-draft-youth-form-${user?.id}`;
  const [form, setForm, clearFormDraft] = usePersistedState(draftKey && `${draftKey}-form`, EMPTY);
  const [skillRows, setSkillRows, clearSkillsDraft] = usePersistedState<SkillRow[]>(draftKey && `${draftKey}-skills`, []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gpsStatus, setGpsStatus] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [photoStatus, setPhotoStatus] = useState("");
  const [photoLoading, setPhotoLoading] = useState(false);

  useEffect(() => {
    if (existing && youthId) {
      setForm({
        ...EMPTY,
        ...Object.fromEntries(
          Object.entries(existing).filter(([k]) => k in EMPTY).map(([k, v]) => [k, v ?? ""])
        ),
        consent_given: !!(existing as any).consent_given,
        needs_training: !!(existing as any).needs_training,
        needs_equipment: !!(existing as any).needs_equipment,
        needs_funding: !!(existing as any).needs_funding,
      });
      setSkillRows(
        ((existing as any).youth_skills ?? []).map((ys: any) => ({
          skill_id: ys.skill?.id ?? "",
          years_of_experience: ys.years_of_experience ?? "",
          proficiency: ys.proficiency ?? "",
          is_primary: ys.is_primary,
        }))
      );
    }
  }, [existing, youthId]);

  const set = (key: keyof typeof EMPTY) => (value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const setLga = (lga: string) =>
    setForm((f) => ({ ...f, lga, ward: (KOGI_WARDS_BY_LGA[lga] ?? []).includes(f.ward) ? f.ward : "" }));

  const wardOptions = KOGI_WARDS_BY_LGA[form.lga] ?? [];

  // Only retakes of an already-saved photo count against the cap — the very first save
  // is free. Admins are exempt, same as the database-side enforcement (the DB is the
  // actual guard; this just avoids surfacing a raw error for the common case).
  const photoRetakesUsed = youthId ? ((existing as any)?.photo_update_count ?? 0) : 0;
  const photoLocked = !!youthId && !!(existing as any)?.photo_url && photoRetakesUsed >= 2 && !isAdminRole(role);

  const captureGps = async () => {
    setGpsLoading(true);
    setGpsStatus("");
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setGpsStatus("Location permission denied.");
      setGpsLoading(false);
      return;
    }
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setForm((f) => ({
        ...f,
        latitude: pos.coords.latitude.toFixed(6),
        longitude: pos.coords.longitude.toFixed(6),
      }));
      setGpsStatus(`Captured (±${Math.round(pos.coords.accuracy ?? 0)}m)`);
    } catch {
      setGpsStatus("Could not get location — check permissions and GPS signal.");
    } finally {
      setGpsLoading(false);
    }
  };

  const capturePhoto = async () => {
    setPhotoStatus("");
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      setPhotoStatus("Camera permission denied.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.6 });
    if (result.canceled || !result.assets?.[0]) return;

    setPhotoLoading(true);
    setPhotoStatus("Uploading…");
    try {
      const uri = result.assets[0].uri;
      const response = await fetch(uri);
      const blob = await response.blob();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const { error } = await supabase.storage.from("youth-photos").upload(path, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      const { data } = supabase.storage.from("youth-photos").getPublicUrl(path);
      set("photo_url")(data.publicUrl);
      setPhotoStatus("Photo uploaded");
    } catch (err: any) {
      setPhotoStatus(`Upload failed: ${err.message}`);
    } finally {
      setPhotoLoading(false);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.first_name.trim()) e.first_name = "Required";
    if (!form.last_name.trim()) e.last_name = "Required";
    if (!form.date_of_birth) e.date_of_birth = "Required (YYYY-MM-DD)";
    if (!form.phone.trim()) e.phone = "Required";
    else if (!/^\+?[\d\s-]{10,15}$/.test(form.phone.trim())) e.phone = "Enter a valid phone number";
    if (!form.ward.trim()) e.ward = "Required";
    if (!form.lga) e.lga = "Required";
    if (!form.consent_given) e.consent_given = "Consent is required to register";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    const payload: Record<string, any> = {
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
    if (!youthId) payload.created_by = user?.id;
    try {
      const saved = await save.mutateAsync(youthId ? { id: youthId, ...payload } : payload);
      if (!youthId) {
        clearFormDraft();
        clearSkillsDraft();
      }
      router.replace(`/youths/${saved.id}`);
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        _root: /may only update their photo/.test(err.message)
          ? "Photo retake limit reached (2/2). Only an admin can change it now."
          : err.message,
      }));
    }
  };

  if (youthId && loadingYouth) return <Spinner />;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-4 pb-10">
      <Card className="gap-3">
        <Text className="text-sm font-bold text-foreground">Photo</Text>
        <View className="flex-row items-center gap-3">
          {form.photo_url ? (
            <Image source={{ uri: form.photo_url }} className="h-16 w-16 rounded-lg" />
          ) : (
            <View className="h-16 w-16 items-center justify-center rounded-lg bg-muted">
              <Ionicons name="person-outline" size={24} color="#8a9a94" />
            </View>
          )}
          <View className="flex-1 gap-1.5">
            {photoLocked ? (
              <Text className="text-xs font-medium text-muted-foreground">
                Photo retake limit reached (2/2). Only an admin can change it now.
              </Text>
            ) : (
              <>
                <Button variant="outline" className="h-9 flex-row gap-1.5 self-start px-3" loading={photoLoading} onPress={capturePhoto}>
                  <Ionicons name="camera-outline" size={16} color="#101a16" />
                  <Text className="text-sm font-semibold text-foreground">{form.photo_url ? "Retake photo" : "Take photo"}</Text>
                </Button>
                {youthId && (existing as any)?.photo_url && !isAdminRole(role) ? (
                  <Text className="text-[11px] text-muted-foreground">{Math.max(0, 2 - photoRetakesUsed)} retake(s) left</Text>
                ) : null}
              </>
            )}
            {photoStatus ? <Text className="text-xs text-muted-foreground">{photoStatus}</Text> : null}
          </View>
        </View>
      </Card>

      <Card className="gap-3">
        <Text className="text-sm font-bold text-foreground">Personal details</Text>
        <Field label="First name" required error={errors.first_name}>
          <Input value={form.first_name} onChangeText={(v) => set("first_name")(v)} autoComplete="given-name" />
        </Field>
        <Field label="Last name" required error={errors.last_name}>
          <Input value={form.last_name} onChangeText={(v) => set("last_name")(v)} autoComplete="family-name" />
        </Field>
        <Field label="Gender" required>
          <SelectField
            label="Gender"
            value={form.gender}
            onChange={(v) => set("gender")(v)}
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
            ]}
          />
        </Field>
        <Field label="Date of birth" required error={errors.date_of_birth}>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            className="h-11 justify-center rounded-lg border border-input bg-card px-3"
          >
            <Text className={`text-sm ${form.date_of_birth ? "text-foreground" : "text-muted-foreground"}`}>
              {form.date_of_birth || "Select date…"}
            </Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={form.date_of_birth ? new Date(form.date_of_birth) : new Date(2000, 0, 1)}
              mode="date"
              maximumDate={new Date()}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_event, selected) => {
                setShowDatePicker(Platform.OS === "ios");
                if (selected) set("date_of_birth")(selected.toISOString().slice(0, 10));
              }}
            />
          )}
        </Field>
        <Field label="Phone" required error={errors.phone}>
          <Input value={form.phone} onChangeText={(v) => set("phone")(v)} placeholder="+234…" keyboardType="phone-pad" />
        </Field>
        <Field label="Email">
          <Input value={form.email} onChangeText={(v) => set("email")(v)} keyboardType="email-address" autoCapitalize="none" />
        </Field>
        <Field label="Means of Identification">
          <SelectField
            label="Means of Identification"
            value={form.government_id_type}
            placeholder="Select Identification…"
            onChange={(v) => set("government_id_type")(v)}
            options={ID_TYPES}
          />
        </Field>
        <Field label="Document Number">
          <Input value={form.government_id} onChangeText={(v) => set("government_id")(v)} placeholder="Document Number" />
        </Field>
        <Field label="Highest education">
          <SelectField
            label="Highest education"
            value={form.highest_education}
            onChange={(v) => set("highest_education")(v)}
            options={EDUCATION_LEVELS.map((l) => ({ value: l, label: l }))}
          />
        </Field>
      </Card>

      <Card className="gap-3">
        <Text className="text-sm font-bold text-foreground">Location</Text>
        <Field label="Home address">
          <Input value={form.address} onChangeText={(v) => set("address")(v)} multiline numberOfLines={2} className="h-20 pt-2" />
        </Field>
        <Field label="LGA" required error={errors.lga}>
          <SelectField
            label="LGA"
            value={form.lga}
            onChange={setLga}
            placeholder="Select LGA…"
            options={KOGI_LGAS.map((l) => ({ value: l, label: l }))}
          />
        </Field>
        <Field label="Ward" required error={errors.ward}>
          <SelectField
            label="Ward"
            value={form.ward}
            onChange={(v) => set("ward")(v)}
            placeholder={form.lga ? "Select ward…" : "Select LGA first…"}
            options={wardOptions.map((w) => ({ value: w, label: w }))}
          />
        </Field>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Field label="Latitude">
              <Input value={form.latitude} onChangeText={(v) => set("latitude")(v)} keyboardType="decimal-pad" />
            </Field>
          </View>
          <View className="flex-1">
            <Field label="Longitude">
              <Input value={form.longitude} onChangeText={(v) => set("longitude")(v)} keyboardType="decimal-pad" />
            </Field>
          </View>
        </View>
        <View className="flex-row items-center gap-3">
          <Button variant="outline" className="h-9 flex-row gap-1.5 px-3" loading={gpsLoading} onPress={captureGps}>
            <Ionicons name="location-outline" size={16} color="#101a16" />
            <Text className="text-sm font-semibold text-foreground">Capture GPS</Text>
          </Button>
          {gpsStatus ? <Text className="flex-1 text-xs text-muted-foreground">{gpsStatus}</Text> : null}
        </View>
      </Card>

      <Card className="gap-3">
        <Text className="text-sm font-bold text-foreground">Employment & business</Text>
        <Field label="Employment status" required>
          <SelectField
            label="Employment status"
            value={form.employment_status}
            onChange={(v) => set("employment_status")(v)}
            options={Object.entries(EMPLOYMENT_LABELS).map(([k, v]) => ({ value: k, label: v }))}
          />
        </Field>
        <Field label="Occupation">
          <Input value={form.occupation} onChangeText={(v) => set("occupation")(v)} />
        </Field>
        <Field label="Monthly income (NGN)">
          <Input value={form.monthly_income} onChangeText={(v) => set("monthly_income")(v)} keyboardType="numeric" />
        </Field>
        <Field label="Business name">
          <Input value={form.business_name} onChangeText={(v) => set("business_name")(v)} />
        </Field>
        <Field label="Business address">
          <Input value={form.business_address} onChangeText={(v) => set("business_address")(v)} />
        </Field>
      </Card>

      <Card className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-bold text-foreground">Skills</Text>
          <Button
            variant="outline"
            className="h-8 px-3"
            onPress={() =>
              setSkillRows((rows) => [...rows, { skill_id: "", years_of_experience: "", proficiency: "", is_primary: rows.length === 0 }])
            }
          >
            <Text className="text-xs font-semibold text-foreground">+ Add skill</Text>
          </Button>
        </View>
        {skillRows.map((row, i) => (
          <View key={i} className="gap-2 rounded-lg border border-border p-3">
            <SelectField
              label="Skill"
              value={row.skill_id}
              placeholder="Select skill…"
              onChange={(v) => setSkillRows((rows) => rows.map((r, j) => (j === i ? { ...r, skill_id: v } : r)))}
              options={(skillsCatalogue as any[]).map((s) => ({ value: s.id, label: s.name }))}
            />
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Input
                  placeholder="Years exp."
                  keyboardType="numeric"
                  value={row.years_of_experience}
                  onChangeText={(v) => setSkillRows((rows) => rows.map((r, j) => (j === i ? { ...r, years_of_experience: v } : r)))}
                />
              </View>
              <View className="flex-1">
                <SelectField
                  label="Proficiency"
                  value={row.proficiency}
                  placeholder="Proficiency…"
                  onChange={(v) => setSkillRows((rows) => rows.map((r, j) => (j === i ? { ...r, proficiency: v } : r)))}
                  options={["beginner", "intermediate", "advanced", "expert"].map((p) => ({
                    value: p,
                    label: p[0].toUpperCase() + p.slice(1),
                  }))}
                />
              </View>
              <Button variant="ghost" className="h-11 w-11 px-0" onPress={() => setSkillRows((rows) => rows.filter((_, j) => j !== i))}>
                <Ionicons name="trash-outline" size={18} color="#b91c1c" />
              </Button>
            </View>
          </View>
        ))}
      </Card>

      <Card className="gap-3">
        <Text className="text-sm font-bold text-foreground">Needs & consent</Text>
        <Checkbox checked={form.needs_training} onToggle={() => set("needs_training")(!form.needs_training)} label="Needs training" />
        <Checkbox checked={form.needs_equipment} onToggle={() => set("needs_equipment")(!form.needs_equipment)} label="Needs equipment" />
        <Checkbox checked={form.needs_funding} onToggle={() => set("needs_funding")(!form.needs_funding)} label="Needs funding" />
        <Pressable
          onPress={() => set("consent_given")(!form.consent_given)}
          className="flex-row items-start gap-2.5 rounded-lg border border-primary/30 bg-primary/5 p-3"
        >
          <View className={`mt-0.5 h-5 w-5 items-center justify-center rounded ${form.consent_given ? "bg-primary" : "border border-input bg-card"}`}>
            {form.consent_given ? <Ionicons name="checkmark" size={14} color="white" /> : null}
          </View>
          <View className="flex-1">
            <Text className="text-sm text-foreground">
              The candidate has given informed consent for their data to be collected and used for the ADOZA empowerment programme.
            </Text>
            {errors.consent_given ? <Text className="mt-1 text-[11px] font-medium text-destructive">{errors.consent_given}</Text> : null}
          </View>
        </Pressable>
      </Card>

      {errors._root ? <Text className="text-sm font-medium text-destructive">{errors._root}</Text> : null}

      <View className="flex-row justify-end gap-2">
        <Button variant="outline" onPress={() => router.back()}>
          Cancel
        </Button>
        <Button loading={save.isPending} onPress={submit}>
          {youthId ? "Save changes" : "Register candidate"}
        </Button>
      </View>
    </ScrollView>
  );
}
