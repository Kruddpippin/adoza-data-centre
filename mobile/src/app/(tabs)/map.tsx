import { useMemo } from "react";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";

import { useDashboardData } from "@/hooks/useData";
import { EmptyState, ErrorState, Spinner } from "@/components/ui";
import { VERIFICATION_META, type VerificationStatus } from "@/lib/utils";

const STATUS_COLORS: Record<VerificationStatus, string> = {
  pending: "#f59e0b",
  verified: "#059669",
  rejected: "#ef4444",
  flagged: "#f97316",
};

export default function FieldMap() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useDashboardData();

  const points = useMemo(
    () => (data?.youths ?? []).filter((y: any) => y.latitude != null && y.longitude != null),
    [data]
  );

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <View className="gap-2 p-4 pb-2">
        <Text className="text-sm text-muted-foreground">
          GPS locations captured during door-to-door registration ({points.length} of {data?.youths?.length ?? 0} records have coordinates).
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <View key={status} className="flex-row items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1">
              <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              <Text className="text-xs text-foreground">{VERIFICATION_META[status as VerificationStatus].label}</Text>
            </View>
          ))}
        </View>
      </View>

      {!points.length ? (
        <EmptyState title="No GPS data yet" message="Youth registrations with captured coordinates will appear here." />
      ) : (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          initialRegion={{ latitude: 7.65, longitude: 6.75, latitudeDelta: 2.5, longitudeDelta: 2.5 }}
        >
          {points.map((y: any) => (
            <Marker
              key={y.id}
              coordinate={{ latitude: Number(y.latitude), longitude: Number(y.longitude) }}
              pinColor={STATUS_COLORS[y.verification_status as VerificationStatus] ?? "#64748b"}
              onCalloutPress={() => router.push(`/youths/${y.id}`)}
            >
              <Callout tooltip={false}>
                <View style={{ minWidth: 160, padding: 4 }}>
                  <Text style={{ fontWeight: "600" }}>
                    {y.first_name} {y.last_name}
                  </Text>
                  <Text style={{ fontSize: 12 }}>
                    {y.ward}, {y.lga}
                  </Text>
                  <Text style={{ fontSize: 12 }}>
                    Status: {VERIFICATION_META[y.verification_status as VerificationStatus]?.label}
                    {y.is_approved_beneficiary ? " · Beneficiary" : ""}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#1a5c3a", marginTop: 2 }}>View profile →</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}
    </SafeAreaView>
  );
}
