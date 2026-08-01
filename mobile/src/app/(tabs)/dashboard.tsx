import { useMemo } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { BarChart, PieChart } from "react-native-gifted-charts";

import { useAuth } from "@/context/AuthContext";
import { useDashboardData } from "@/hooks/useData";
import { Badge, Card, ErrorState, Spinner } from "@/components/ui";
import { EMPLOYMENT_LABELS, formatNaira, VERIFICATION_META, type VerificationStatus } from "@/lib/utils";

const PIE_COLORS = ["#f59e0b", "#059669", "#ef4444", "#f97316"];
const EMP_COLORS = ["#0f766e", "#dc2626", "#2563eb", "#9333ea"];

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="min-w-[46%] flex-1 gap-1.5">
      <Text className="text-xs font-medium text-muted-foreground">{label}</Text>
      <Text className="text-xl font-bold tracking-tight text-foreground">{value}</Text>
    </Card>
  );
}

export default function Dashboard() {
  const { profile } = useAuth();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useDashboardData();

  const stats = useMemo(() => {
    if (!data) return null;
    const youthList = data.youths;
    const verified = youthList.filter((y: any) => y.verification_status === "verified");
    const pending = youthList.filter((y: any) => y.verification_status === "pending");
    const beneficiaries = youthList.filter((y: any) => y.is_approved_beneficiary);
    const disbursed = data.funding
      .filter((f: any) => f.status === "disbursed")
      .reduce((s: number, f: any) => s + Number(f.amount_approved || 0), 0);
    const assignedEquipment = data.equipment.filter((e: any) => ["assigned", "delivered"].includes(e.status)).length;

    const byLga = Object.entries(
      youthList.reduce((acc: Record<string, number>, y: any) => ({ ...acc, [y.lga]: (acc[y.lga] || 0) + 1 }), {})
    )
      .map(([lga, count]) => ({ label: lga, value: count as number, frontColor: "#1a5c3a" }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const byStatus = (["pending", "verified", "rejected", "flagged"] as VerificationStatus[])
      .map((s, i) => ({
        text: VERIFICATION_META[s].label,
        value: youthList.filter((y: any) => y.verification_status === s).length,
        color: PIE_COLORS[i],
      }))
      .filter((d) => d.value > 0);

    const byEmployment = Object.entries(
      youthList.reduce((acc: Record<string, number>, y: any) => ({ ...acc, [y.employment_status]: (acc[y.employment_status] || 0) + 1 }), {})
    ).map(([k, v], i) => ({ text: EMPLOYMENT_LABELS[k] ?? k, value: v as number, color: EMP_COLORS[i % EMP_COLORS.length] }));

    const recent = [...youthList]
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6);

    return {
      total: youthList.length,
      verified: verified.length,
      pending: pending.length,
      beneficiaries: beneficiaries.length,
      disbursed,
      assignedEquipment,
      byLga,
      byStatus,
      byEmployment,
      recent,
    };
  }, [data]);

  if (isLoading) return <Spinner />;
  if (isError || !stats) return <ErrorState onRetry={refetch} />;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-4">
      <View>
        <Text className="text-xl font-bold tracking-tight text-foreground">
          Welcome back, {profile?.name?.split(" ")[0] ?? "there"}
        </Text>
        <Text className="mt-1 text-sm text-muted-foreground">Programme snapshot across Kogi State.</Text>
      </View>

      <View className="flex-row flex-wrap gap-3">
        <StatTile label="Registered youths" value={stats.total} />
        <StatTile label="Verified" value={stats.verified} />
        <StatTile label="Pending review" value={stats.pending} />
        <StatTile label="Beneficiaries" value={stats.beneficiaries} />
        <StatTile label="Funds disbursed" value={formatNaira(stats.disbursed)} />
        <StatTile label="Equipment assigned" value={stats.assignedEquipment} />
      </View>

      <Card className="gap-3">
        <Text className="text-sm font-semibold text-foreground">Registrations by LGA</Text>
        <BarChart
          data={stats.byLga}
          height={180}
          barWidth={22}
          spacing={18}
          barBorderRadius={4}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor="#e6ece9"
          hideRules
          noOfSections={4}
          xAxisLabelTextStyle={{ fontSize: 9, color: "#6b7a75" }}
          yAxisTextStyle={{ fontSize: 10, color: "#6b7a75" }}
        />
      </Card>

      <Card className="items-center gap-3">
        <Text className="w-full text-sm font-semibold text-foreground">Verification status</Text>
        <PieChart data={stats.byStatus} donut radius={70} innerRadius={44} />
        <View className="w-full flex-row flex-wrap justify-center gap-3">
          {stats.byStatus.map((d) => (
            <View key={d.text} className="flex-row items-center gap-1.5">
              <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
              <Text className="text-xs text-muted-foreground">
                {d.text} ({d.value})
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Card className="items-center gap-3">
        <Text className="w-full text-sm font-semibold text-foreground">Employment breakdown</Text>
        <PieChart data={stats.byEmployment} radius={70} />
        <View className="w-full flex-row flex-wrap justify-center gap-3">
          {stats.byEmployment.map((d) => (
            <View key={d.text} className="flex-row items-center gap-1.5">
              <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
              <Text className="text-xs text-muted-foreground">
                {d.text} ({d.value})
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Card className="gap-1">
        <Text className="mb-1 text-sm font-semibold text-foreground">Recent registrations</Text>
        {stats.recent.map((y: any) => {
          const meta = VERIFICATION_META[y.verification_status as VerificationStatus];
          return (
            <Pressable
              key={y.id}
              onPress={() => router.push(`/youths/${y.id}`)}
              className="flex-row items-center justify-between gap-3 border-t border-border py-2.5 first:border-t-0"
            >
              <View className="min-w-0 flex-1">
                <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                  {y.first_name} {y.last_name}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {y.ward}, {y.lga}
                </Text>
              </View>
              {meta ? <Badge label={meta.label} bg={meta.bg} fg={meta.fg} /> : null}
            </Pressable>
          );
        })}
      </Card>
    </ScrollView>
  );
}
