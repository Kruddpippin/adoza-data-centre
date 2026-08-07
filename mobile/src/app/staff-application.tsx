import { useState } from "react";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { Image, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useMyStaffApplication, useSubmitStaffApplication } from "@/hooks/useData";
import { supabase } from "@/lib/supabase";
import { Button, Card, Field, Input, Spinner, ErrorState } from "@/components/ui";
import { SelectField } from "@/components/select-modal";
import { APPLICABLE_ROLES, EDUCATION_LEVELS, EMPLOYMENT_LABELS, KOGI_LGAS, KOGI_WARDS_BY_LGA, ROLE_LABELS } from "@/lib/utils";

function PortalHeader() {
  const { signOut } = useAuth();
  return (
    <View className="mb-4 flex-row items-center justify-between px-4 pt-2">
      <View>
        <Text className="text-sm font-bold text-foreground">ADOZA Data Centre</Text>
        <Text className="text-xs text-muted-foreground">Staff application</Text>
      </View>
      <Button variant="outline" className="h-9 px-3" onPress={() => signOut()}>
        <Ionicons name="log-out-outline" size={16} color="#101a16" />
        <Text className="text-sm font-semibold text-foreground">Sign out</Text>
      </Button>
    </View>
  );
}

function ApplicationStatus({ application }: { application: any }) {
  if (application.status === "pending") {
    return (
      <Card className="items-center gap-2 p-6">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-amber-100">
          <Ionicons name="time-outline" size={22} color="#b45309" />
        </View>
        <Text className="text-center text-base font-bold text-foreground">Application pending</Text>
        <Text className="text-center text-sm text-muted-foreground">
          You applied for {ROLE_LABELS[application.applied_role as keyof typeof ROLE_LABELS]}. An administrator will
          review your application shortly.
        </Text>
      </Card>
    );
  }
  if (application.status === "rejected") {
    return (
      <Card className="items-center gap-2 p-6">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <Ionicons name="close-circle-outline" size={22} color="#b91c1c" />
        </View>
        <Text className="text-center text-base font-bold text-foreground">Application not approved</Text>
        <Text className="text-center text-sm text-muted-foreground">
          Your application for {ROLE_LABELS[application.applied_role as keyof typeof ROLE_LABELS]} was not approved.
        </Text>
      </Card>
    );
  }
  return (
    <Card className="items-center gap-2 p-6">
      <Text className="text-center text-base font-bold text-foreground">Application approved</Text>
      <Text className="text-center text-sm text-muted-foreground">Please sign out and sign back in to access your account.</Text>
    </Card>
  );
}

const EMPTY = {
  photo_url: "",
  first_name: "",
  last_name: "",
  gender: "male",
  date_of_birth: "",
  phone: "",
  address: "",
  ward: "",
  lga: "",
  occupation: "",
  highest_education: "Secondary",
  employment_status: "unemployed",
  latitude: "",
  longitude: "",
  consent_given: false,
};

function ApplyForm({ user }: { user: { id: string; email?: string } }) {
  const submit = useSubmitStaffApplication();
  const [form, setForm] = useState(EMPTY);
  const [appliedRole, setAppliedRole] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gpsStatus, setGpsStatus] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [photoStatus, setPhotoStatus] = useState("");
  const [photoLoading, setPhotoLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const set = (key: keyof typeof EMPTY) => (value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const setLga = (lga: string) =>
    setForm((f) => ({ ...f, lga, ward: (KOGI_WARDS_BY_LGA[lga] ?? []).includes(f.ward) ? f.ward : "" }));

  const wardOptions = KOGI_WARDS_BY_LGA[form.lga] ?? [];

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
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], cameraType: ImagePicker.CameraType.front, quality: 0.6 });
    if (result.canceled || !result.assets?.[0]) return;

    setPhotoLoading(true);
    setPhotoStatus("Uploading…");
    try {
      const uri = result.assets[0].uri;
      const response = await fetch(uri);
      const blob = await response.blob();
      const path = `staff/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
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
    if (!form.date_of_birth) e.date_of_birth = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.lga) e.lga = "Required";
    if (!form.ward) e.ward = "Required";
    if (!appliedRole) e.appliedRole = "Required";
    if (!form.consent_given) e.consent_given = "Consent is required to apply";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await submit.mutateAsync({
        user_id: user.id,
        name: `${form.first_name.trim()} ${form.last_name.trim()}`.trim(),
        email: user.email,
        applied_role: appliedRole,
        photo_url: form.photo_url || null,
        gender: form.gender,
        date_of_birth: form.date_of_birth,
        phone: form.phone,
        lga: form.lga,
        ward: form.ward,
        address: form.address,
        employment_status: form.employment_status,
        highest_education: form.highest_education,
        occupation: form.occupation,
        latitude: form.latitude === "" ? null : Number(form.latitude),
        longitude: form.longitude === "" ? null : Number(form.longitude),
        consent_given: form.consent_given,
        consent_date: new Date().toISOString(),
      });
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, _root: err.message }));
    }
  };

  return (
    <View className="gap-4 px-4 pb-10">
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
            <Button variant="outline" className="h-9 flex-row gap-1.5 self-start px-3" loading={photoLoading} onPress={capturePhoto}>
              <Ionicons name="camera-outline" size={16} color="#101a16" />
              <Text className="text-sm font-semibold text-foreground">{form.photo_url ? "Retake photo" : "Take photo"}</Text>
            </Button>
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
              value={form.date_of_birth ? new Date(form.date_of_birth) : new Date(1995, 0, 1)}
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
          <Input value={user?.email ?? ""} editable={false} />
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
        <Text className="text-sm font-bold text-foreground">Employment</Text>
        <Field label="Employment status" required>
          <SelectField
            label="Employment status"
            value={form.employment_status}
            onChange={(v) => set("employment_status")(v)}
            options={Object.entries(EMPLOYMENT_LABELS).map(([k, v]) => ({ value: k, label: v as string }))}
          />
        </Field>
        <Field label="Highest education">
          <SelectField
            label="Highest education"
            value={form.highest_education}
            onChange={(v) => set("highest_education")(v)}
            options={EDUCATION_LEVELS.map((l) => ({ value: l, label: l }))}
          />
        </Field>
        <Field label="Occupation">
          <Input value={form.occupation} onChangeText={(v) => set("occupation")(v)} />
        </Field>
      </Card>

      <Card className="gap-3">
        <Text className="text-sm font-bold text-foreground">Role & consent</Text>
        <Field label="Role you're applying for" required error={errors.appliedRole}>
          <SelectField
            label="Role"
            value={appliedRole}
            onChange={setAppliedRole}
            placeholder="Select a role…"
            options={APPLICABLE_ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
          />
        </Field>
        <Pressable
          onPress={() => set("consent_given")(!form.consent_given)}
          className="flex-row items-start gap-2.5 rounded-lg border border-primary/30 bg-primary/5 p-3"
        >
          <View className={`mt-0.5 h-5 w-5 items-center justify-center rounded ${form.consent_given ? "bg-primary" : "border border-input bg-card"}`}>
            {form.consent_given ? <Ionicons name="checkmark" size={14} color="white" /> : null}
          </View>
          <View className="flex-1">
            <Text className="text-sm text-foreground">
              I consent to the collection and use of my data for the ADOZA Data Centre project.
            </Text>
            {errors.consent_given ? <Text className="mt-1 text-[11px] font-medium text-destructive">{errors.consent_given}</Text> : null}
          </View>
        </Pressable>
      </Card>

      {errors._root ? <Text className="text-sm font-medium text-destructive">{errors._root}</Text> : null}

      <Button loading={submit.isPending} onPress={handleSubmit}>
        <Ionicons name="send-outline" size={16} color="white" />
        Submit application
      </Button>
    </View>
  );
}

export default function StaffApplication() {
  const { user, signOut } = useAuth();
  const { data: application, isLoading, isError, refetch } = useMyStaffApplication(user?.id);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        <PortalHeader />
        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <View className="px-4">
            <ErrorState onRetry={refetch} />
          </View>
        ) : application ? (
          <View className="px-4">
            <ApplicationStatus application={application} />
            <Button variant="outline" className="mt-4 self-center" onPress={() => signOut()}>
              Sign out
            </Button>
          </View>
        ) : user ? (
          <ApplyForm user={user as any} />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
