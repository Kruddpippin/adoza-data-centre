import { useState } from "react";
import { useRouter } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/context/AuthContext";
import { useYouths } from "@/hooks/useData";
import { Badge, Button, EmptyState, ErrorState, Input, Spinner } from "@/components/ui";
import { SelectField } from "@/components/select-modal";
import { ageFrom, EMPLOYMENT_LABELS, formatDate, isAdminRole, KOGI_LGAS, VERIFICATION_META, type VerificationStatus } from "@/lib/utils";

export default function YouthsList() {
  const { role } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [lga, setLga] = useState("");

  const { data: youths, isLoading, isError, refetch } = useYouths({
    search: search || undefined,
    status: status || undefined,
    lga: lga || undefined,
  });

  const canRegister = isAdminRole(role) || role === "enumerator" || role === "field_agent";

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <View className="gap-3 p-4">
        <View className="flex-row items-center gap-2">
          <View className="relative flex-1 justify-center">
            <Input placeholder="Search name or phone…" value={search} onChangeText={setSearch} className="pl-9" />
            <Ionicons name="search" size={16} color="#6b7a75" style={{ position: "absolute", left: 12 }} />
          </View>
          {canRegister && (
            <Button className="h-11 w-11 px-0" onPress={() => router.push("/youths/new")}>
              <Ionicons name="add" size={22} color="white" />
            </Button>
          )}
        </View>
        <View className="flex-row gap-2">
          <View className="flex-1">
            <SelectField
              label="Filter by status"
              value={status}
              onChange={setStatus}
              placeholder="All statuses"
              options={Object.entries(VERIFICATION_META).map(([k, v]) => ({ value: k, label: v.label }))}
            />
          </View>
          <View className="flex-1">
            <SelectField
              label="Filter by LGA"
              value={lga}
              onChange={setLga}
              placeholder="All LGAs"
              options={KOGI_LGAS.map((l) => ({ value: l, label: l }))}
            />
          </View>
        </View>
      </View>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !youths?.length ? (
        <EmptyState title="No candidates found" message="Adjust your filters, or register the first candidate." />
      ) : (
        <FlatList
          data={youths}
          keyExtractor={(item: any) => item.id}
          contentContainerClassName="gap-2 px-4 pb-4"
          renderItem={({ item: y }: { item: any }) => {
            const meta = VERIFICATION_META[y.verification_status as VerificationStatus];
            return (
              <Pressable
                onPress={() => router.push(`/youths/${y.id}`)}
                className="gap-2 rounded-xl border border-border bg-card p-3.5"
              >
                <View className="flex-row items-center justify-between gap-2">
                  <Text className="flex-1 text-sm font-semibold text-foreground" numberOfLines={1}>
                    {y.first_name} {y.last_name}
                  </Text>
                  {meta ? <Badge label={meta.label} bg={meta.bg} fg={meta.fg} /> : null}
                </View>
                <Text className="text-xs text-muted-foreground">
                  {y.ward}, {y.lga} · Age {ageFrom(y.date_of_birth) ?? "—"} · {EMPLOYMENT_LABELS[y.employment_status] ?? "—"}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-semibold text-foreground">Score: {y.eligibility_score ?? "—"}</Text>
                  <Text className="text-[11px] text-muted-foreground">{formatDate(y.created_at)}</Text>
                </View>
                {y.is_approved_beneficiary ? <Badge label="Beneficiary" bg="#1a5c3a1a" fg="#1a5c3a" /> : null}
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
