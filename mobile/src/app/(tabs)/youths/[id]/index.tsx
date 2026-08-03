import { useState } from "react";
import { Image, Linking, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

import { useAuth } from "@/context/AuthContext";
import { useUpdateYouth, useYouth } from "@/hooks/useData";
import { Badge, Button, Card, ErrorState, Field, Input, Spinner } from "@/components/ui";
import {
  DELIVERY_METHOD_LABELS, EMPLOYMENT_LABELS, formatDate, formatDateTime, formatNaira, isAdminRole,
  VERIFICATION_META, type VerificationStatus,
} from "@/lib/utils";

type ModalKind = "reject" | "flag" | "deny" | null;

function TrainingCard({ youth, canEdit }: { youth: any; canEdit: boolean }) {
  const update = useUpdateYouth();
  const [date, setDate] = useState<string>(youth.training_commencement_date ?? "");
  const [venue, setVenue] = useState<string>(youth.training_venue ?? "");
  const [notes, setNotes] = useState<string>(youth.training_notes ?? "");
  const [showDatePicker, setShowDatePicker] = useState(false);

  if (!canEdit) {
    return (
      <Card className="gap-2">
        <Text className="text-sm font-bold text-foreground">Training commencement</Text>
        <InfoRow icon="calendar-outline" label="Date" value={formatDate(youth.training_commencement_date)} />
        <InfoRow icon="location-outline" label="Venue" value={youth.training_venue} />
        {youth.training_notes ? <Text className="text-sm text-muted-foreground">{youth.training_notes}</Text> : null}
      </Card>
    );
  }

  return (
    <Card className="gap-3">
      <Text className="text-sm font-bold text-foreground">Training commencement</Text>
      <Field label="Commencement date">
        <Pressable onPress={() => setShowDatePicker(true)} className="h-11 justify-center rounded-lg border border-input bg-card px-3">
          <Text className={`text-sm ${date ? "text-foreground" : "text-muted-foreground"}`}>{date || "Select date…"}</Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            value={date ? new Date(date) : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_event, selected) => {
              setShowDatePicker(Platform.OS === "ios");
              if (selected) setDate(selected.toISOString().slice(0, 10));
            }}
          />
        )}
      </Field>
      <Field label="Venue">
        <Input value={venue} onChangeText={setVenue} placeholder="e.g. Lokoja Skills Acquisition Centre" />
      </Field>
      <Field label="Notes">
        <Input value={notes} onChangeText={setNotes} multiline numberOfLines={2} className="h-20 pt-2" />
      </Field>
      <Button
        className="h-9 self-start px-3"
        loading={update.isPending}
        onPress={() =>
          update.mutateAsync({
            id: youth.id,
            training_commencement_date: date || null,
            training_venue: venue || null,
            training_notes: notes || null,
          })
        }
      >
        Save training details
      </Button>
    </Card>
  );
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value?: string | null }) {
  return (
    <View className="flex-row items-start gap-2.5">
      <Ionicons name={icon} size={16} color="#6b7a75" style={{ marginTop: 2 }} />
      <View className="min-w-0 flex-1">
        <Text className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</Text>
        <Text className="text-sm text-foreground">{value || "—"}</Text>
      </View>
    </View>
  );
}

export default function YouthDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { role, user } = useAuth();
  const { data: youth, isLoading, isError, refetch } = useYouth(id);
  const update = useUpdateYouth();
  const [modal, setModal] = useState<ModalKind>(null);
  const [notes, setNotes] = useState("");

  if (isLoading) return <Spinner />;
  if (isError || !youth) return <ErrorState onRetry={refetch} />;

  const canVerify = isAdminRole(role) || role === "validator";
  const canApproveBeneficiary = isAdminRole(role) || role === "committee";
  const canEdit =
    isAdminRole(role) ||
    ((role === "enumerator" || role === "field_agent") && youth.created_by === user?.id && youth.verification_status === "pending");
  const meta = VERIFICATION_META[youth.verification_status as VerificationStatus];

  const setVerification = (status: string, extraNotes?: string) =>
    update.mutateAsync({
      id: id!,
      verification_status: status,
      verification_notes: extraNotes ?? null,
      verified_by: user!.id,
      verified_at: new Date().toISOString(),
    });

  const approveBeneficiary = () =>
    update.mutateAsync({
      id: id!,
      is_approved_beneficiary: true,
      beneficiary_approved_at: new Date().toISOString(),
      beneficiary_rejection_reason: null,
    });

  const denyBeneficiary = (reason: string) => update.mutateAsync({ id: id!, is_approved_beneficiary: false, beneficiary_rejection_reason: reason });

  const submitModal = async () => {
    if (modal === "reject") await setVerification("rejected", notes);
    if (modal === "flag") await setVerification("flagged", notes);
    if (modal === "deny") await denyBeneficiary(notes);
    setModal(null);
    setNotes("");
  };

  return (
    <>
      <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-4 pb-10">
        <View className="gap-1">
          <View className="flex-row flex-wrap items-center justify-between gap-3">
            <View className="flex-row flex-wrap items-center gap-3">
              {youth.photo_url ? (
                <Image source={{ uri: youth.photo_url }} className="h-12 w-12 rounded-full" />
              ) : null}
              <View className="flex-row flex-wrap items-center gap-2">
                <Text className="text-xl font-bold tracking-tight text-foreground">
                  {youth.first_name} {youth.last_name}
                </Text>
                {meta ? <Badge label={meta.label} bg={meta.bg} fg={meta.fg} /> : null}
                {youth.is_approved_beneficiary ? <Badge label="Beneficiary" bg="#1a5c3a1a" fg="#1a5c3a" /> : null}
              </View>
            </View>
            {canEdit && (
              <Button variant="outline" className="h-9 px-3" onPress={() => router.push(`/youths/${id}/edit`)}>
                <Text className="text-xs font-semibold text-foreground">Edit</Text>
              </Button>
            )}
          </View>
          <Text className="text-sm text-muted-foreground">
            Registered by {youth.created_by_profile?.name ?? "unknown"} on {formatDate(youth.created_at)}
          </Text>
        </View>

        {(canVerify || canApproveBeneficiary) && (
          <Card className="gap-2 border-primary/20 bg-primary/[0.03]">
            <Text className="text-sm font-semibold text-foreground">Workflow actions</Text>
            <View className="flex-row flex-wrap gap-2">
              {canVerify && youth.verification_status !== "verified" && (
                <Button className="h-9 px-3" loading={update.isPending} onPress={() => setVerification("verified")}>
                  Verify
                </Button>
              )}
              {canVerify && youth.verification_status !== "rejected" && (
                <Button variant="destructive" className="h-9 px-3" onPress={() => setModal("reject")}>
                  Reject
                </Button>
              )}
              {canVerify && youth.verification_status !== "flagged" && (
                <Button variant="outline" className="h-9 px-3" onPress={() => setModal("flag")}>
                  Flag
                </Button>
              )}
              {canApproveBeneficiary && youth.verification_status === "verified" && !youth.is_approved_beneficiary && (
                <Button className="h-9 bg-accent px-3" loading={update.isPending} onPress={approveBeneficiary}>
                  Approve as beneficiary
                </Button>
              )}
              {canApproveBeneficiary && youth.is_approved_beneficiary && (
                <Button variant="outline" className="h-9 px-3" onPress={() => setModal("deny")}>
                  Revoke beneficiary
                </Button>
              )}
            </View>
            {youth.verification_notes ? (
              <Text className="text-xs text-muted-foreground">
                Note: {youth.verification_notes} — {youth.verified_by_profile?.name}, {formatDateTime(youth.verified_at)}
              </Text>
            ) : null}
          </Card>
        )}

        <Card className="gap-4">
          <Text className="text-sm font-bold text-foreground">Personal information</Text>
          <InfoRow icon="call-outline" label="Phone" value={youth.phone} />
          <InfoRow icon="mail-outline" label="Email" value={youth.email} />
          <InfoRow icon="location-outline" label="Address" value={youth.address} />
          <InfoRow icon="location-outline" label="Ward / LGA" value={`${youth.ward}, ${youth.lga}`} />
          <InfoRow icon="school-outline" label="Education" value={youth.highest_education} />
          <InfoRow
            icon="briefcase-outline"
            label="Employment"
            value={`${EMPLOYMENT_LABELS[youth.employment_status] ?? "—"}${youth.occupation ? ` — ${youth.occupation}` : ""}`}
          />
          <InfoRow icon="cash-outline" label="Monthly income" value={formatNaira(youth.monthly_income)} />
          <InfoRow icon="storefront-outline" label="Business" value={youth.business_name} />
        </Card>

        <Card className="gap-2">
          <Text className="text-sm font-bold text-foreground">Skills</Text>
          {youth.youth_skills?.length ? (
            youth.youth_skills.map((ys: any) => (
              <View key={ys.id} className="flex-row items-center justify-between gap-3 rounded-lg border border-border p-3">
                <View className="min-w-0 flex-1">
                  <Text className="text-sm font-medium text-foreground">
                    {ys.skill?.name}
                    {ys.is_primary ? <Text className="text-[10px] font-semibold uppercase text-accent"> · Primary</Text> : null}
                  </Text>
                  <Text className="text-xs text-muted-foreground">{ys.skill?.category}</Text>
                </View>
                <Text className="text-xs text-muted-foreground">
                  {ys.years_of_experience != null ? `${ys.years_of_experience} yrs` : ""}
                  {ys.proficiency ? ` · ${ys.proficiency}` : ""}
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-sm text-muted-foreground">No skills recorded.</Text>
          )}
        </Card>

        {youth.verification_status === "verified" && canApproveBeneficiary && (
          <Card className="gap-2">
            <Text className="text-sm font-bold text-foreground">Banking details</Text>
            {youth.youth_bank_details ? (
              <>
                <InfoRow icon="business-outline" label="Bank" value={youth.youth_bank_details.bank_name} />
                <InfoRow icon="card-outline" label="Account number" value={youth.youth_bank_details.account_number} />
                <InfoRow icon="person-outline" label="Account name" value={youth.youth_bank_details.account_name} />
                {(youth.youth_bank_details.next_of_kin_name || youth.youth_bank_details.next_of_kin_phone) && (
                  <InfoRow
                    icon="people-outline"
                    label="Next of kin"
                    value={[youth.youth_bank_details.next_of_kin_name, youth.youth_bank_details.next_of_kin_phone].filter(Boolean).join(" — ")}
                  />
                )}
              </>
            ) : (
              <Text className="text-sm text-muted-foreground">Not submitted yet.</Text>
            )}
          </Card>
        )}

        {youth.is_approved_beneficiary && (youth.needs_funding || youth.needs_equipment) && (
          <Card className="gap-2">
            <Text className="text-sm font-bold text-foreground">Delivery preference</Text>
            {youth.youth_delivery_preferences ? (
              <>
                <InfoRow
                  icon="cube-outline"
                  label="Method"
                  value={DELIVERY_METHOD_LABELS[youth.youth_delivery_preferences.method] ?? youth.youth_delivery_preferences.method}
                />
                {youth.youth_delivery_preferences.address ? (
                  <InfoRow icon="location-outline" label="Address" value={youth.youth_delivery_preferences.address} />
                ) : null}
              </>
            ) : (
              <Text className="text-sm text-muted-foreground">Not chosen yet.</Text>
            )}
          </Card>
        )}

        {youth.is_approved_beneficiary && youth.needs_training && (
          <TrainingCard youth={youth} canEdit={canApproveBeneficiary} />
        )}

        <Card className="items-center gap-2 p-5">
          <Text className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Eligibility score</Text>
          <Text className={`text-5xl font-bold tracking-tight ${(youth.eligibility_score ?? 0) >= 60 ? "text-primary" : "text-amber-600"}`}>
            {youth.eligibility_score ?? "—"}
          </Text>
          <Text className="text-center text-[11px] text-muted-foreground">
            Weighted across age, employment, skills, experience, needs and ward coverage.
          </Text>
          <View className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
            <View className="h-full rounded-full bg-primary" style={{ width: `${youth.eligibility_score ?? 0}%` }} />
          </View>
        </Card>

        <Card className="gap-3">
          <Text className="text-sm font-bold text-foreground">Field capture</Text>
          <InfoRow
            icon="navigate-outline"
            label="Coordinates"
            value={youth.latitude != null ? `${Number(youth.latitude).toFixed(4)}, ${Number(youth.longitude).toFixed(4)}` : null}
          />
          {youth.latitude != null && (
            <Pressable onPress={() => Linking.openURL(`https://www.google.com/maps?q=${youth.latitude},${youth.longitude}`)}>
              <Text className="text-xs font-medium text-primary">Open in Google Maps</Text>
            </Pressable>
          )}
          <InfoRow
            icon="shield-checkmark-outline"
            label="Consent"
            value={youth.consent_given ? `Given ${formatDate(youth.consent_date)}` : "Not given"}
          />
          <InfoRow icon="card-outline" label="Government ID" value={youth.government_id} />
          <View className="flex-row gap-1.5">
            {[
              ["Training", youth.needs_training],
              ["Equipment", youth.needs_equipment],
              ["Funding", youth.needs_funding],
            ].map(([label, val]) => (
              <View key={label as string} className={`flex-1 rounded-md px-2 py-1.5 ${val ? "bg-accent/15" : "bg-muted"}`}>
                <Text className={`text-center text-[10px] font-semibold ${val ? "text-accent-foreground" : "text-muted-foreground"}`}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>

      <Modal visible={!!modal} transparent animationType="fade" onRequestClose={() => setModal(null)}>
        <View className="flex-1 items-center justify-center bg-black/40 p-5">
          <View className="w-full gap-4 rounded-2xl bg-card p-5">
            <Text className="text-base font-bold text-foreground">
              {modal === "reject" ? "Reject registration" : modal === "flag" ? "Flag for review" : "Revoke beneficiary status"}
            </Text>
            <Field label={modal === "deny" ? "Reason" : "Notes"} required>
              <Input value={notes} onChangeText={setNotes} multiline numberOfLines={3} className="h-20 pt-2" placeholder="Explain the decision…" />
            </Field>
            <View className="flex-row justify-end gap-2">
              <Button variant="outline" className="h-9 px-3" onPress={() => setModal(null)}>
                Cancel
              </Button>
              <Button
                variant={modal === "flag" ? "default" : "destructive"}
                className="h-9 px-3"
                disabled={!notes.trim()}
                loading={update.isPending}
                onPress={submitModal}
              >
                Confirm
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
