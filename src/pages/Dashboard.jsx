import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users, BadgeCheck, Award, Banknote, Package, Clock, ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useDashboardData } from "@/hooks/useData";
import { useAuth } from "@/context/AuthContext";
import { StatCard, Card, CardHeader, CardTitle, CardContent, Spinner, ErrorState, Badge, Button } from "@/components/ui";
import { formatNaira, VERIFICATION_META, EMPLOYMENT_LABELS } from "@/lib/utils";

const PIE_COLORS = ["#f59e0b", "#059669", "#ef4444", "#f97316"];
const EMP_COLORS = ["#0f766e", "#dc2626", "#2563eb", "#9333ea"];

export default function Dashboard() {
  const { profile } = useAuth();
  const { data, isLoading, isError, refetch } = useDashboardData();

  const stats = useMemo(() => {
    if (!data) return null;
    const { youths, equipment, funding } = data;
    const verified = youths.filter((y) => y.verification_status === "verified");
    const pending = youths.filter((y) => y.verification_status === "pending");
    const beneficiaries = youths.filter((y) => y.is_approved_beneficiary);
    const disbursed = funding.filter((f) => f.status === "disbursed").reduce((s, f) => s + Number(f.amount_approved || 0), 0);
    const assignedEquipment = equipment.filter((e) => ["assigned", "delivered"].includes(e.status)).length;

    const byLga = Object.entries(
      youths.reduce((acc, y) => ({ ...acc, [y.lga]: (acc[y.lga] || 0) + 1 }), {})
    )
      .map(([lga, count]) => ({ lga, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const byStatus = ["pending", "verified", "rejected", "flagged"].map((s) => ({
      name: VERIFICATION_META[s].label,
      value: youths.filter((y) => y.verification_status === s).length,
    })).filter((d) => d.value > 0);

    const byEmployment = Object.entries(
      youths.reduce((acc, y) => ({ ...acc, [y.employment_status]: (acc[y.employment_status] || 0) + 1 }), {})
    ).map(([k, v]) => ({ name: EMPLOYMENT_LABELS[k] ?? k, value: v }));

    const recent = [...youths]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 6);

    return { total: youths.length, verified: verified.length, pending: pending.length, beneficiaries: beneficiaries.length, disbursed, assignedEquipment, byLga, byStatus, byEmployment, recent };
  }, [data]);

  if (isLoading) return <Spinner />;
  if (isError || !stats) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="font-display text-xl font-bold tracking-tight lg:text-2xl">
          Welcome back, {profile?.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Programme snapshot across Kogi State.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6 lg:gap-4">
        <StatCard className="animate-fade-up stagger-1" icon={Users} label="Registered candidates" value={stats.total} tone="primary" />
        <StatCard className="animate-fade-up stagger-2" icon={BadgeCheck} label="Verified" value={stats.verified} tone="emerald" />
        <StatCard className="animate-fade-up stagger-3" icon={Clock} label="Pending review" value={stats.pending} tone="amber" />
        <StatCard className="animate-fade-up stagger-4" icon={Award} label="Beneficiaries" value={stats.beneficiaries} tone="accent" />
        <StatCard className="animate-fade-up stagger-5" icon={Banknote} label="Funds disbursed" value={formatNaira(stats.disbursed)} tone="blue" />
        <StatCard className="animate-fade-up stagger-6" icon={Package} label="Equipment assigned" value={stats.assignedEquipment} tone="primary" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="animate-fade-up lg:col-span-2">
          <CardHeader>
            <CardTitle>Registrations by LGA</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byLga} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(150 14% 90%)" vertical={false} />
                <XAxis dataKey="lga" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={48} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: "hsl(150 12% 96%)" }} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="count" name="Candidates" fill="hsl(152 65% 28%)" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-up">
          <CardHeader>
            <CardTitle>Verification status</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.byStatus} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={3}>
                  {stats.byStatus.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="animate-fade-up">
          <CardHeader>
            <CardTitle>Employment breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.byEmployment} dataKey="value" nameKey="name" outerRadius={70}>
                  {stats.byEmployment.map((_, i) => (
                    <Cell key={i} fill={EMP_COLORS[i % EMP_COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-up lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent registrations</CardTitle>
            <Link to="/youths" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {stats.recent.map((y) => (
                <li key={y.id}>
                  <Link to={`/youths/${y.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:bg-muted/50 rounded-lg px-2 -mx-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{y.first_name} {y.last_name}</p>
                      <p className="text-xs text-muted-foreground">{y.ward}, {y.lga}</p>
                    </div>
                    <Badge className={VERIFICATION_META[y.verification_status]?.cls}>
                      {VERIFICATION_META[y.verification_status]?.label}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
