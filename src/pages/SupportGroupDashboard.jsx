import { Navigate } from "react-router-dom";
import { Phone, Briefcase, CalendarClock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMySupportGroupMembership } from "@/hooks/useSupportGroup";
import { SupportGroupNav } from "@/components/SupportGroupNav";
import { Card, CardHeader, CardTitle, CardContent, Spinner, ErrorState } from "@/components/ui";
import { formatDate } from "@/lib/utils";

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

export default function SupportGroupDashboard() {
  const { session, user, loading: authLoading } = useAuth();
  const { data: member, isLoading, isError, refetch } = useMySupportGroupMembership(user?.id);

  if (authLoading) return <Spinner className="min-h-screen" />;
  // This portal is support-group-member-only — a lost session sends them back to the
  // GYB2SYB registration/sign-in page, not any other login.
  if (!session) return <Navigate to="/gyb2syb" replace />;
  // Not (yet) an approved member — send them back to see their registration status.
  if (!isLoading && !isError && !member) return <Navigate to="/gyb2syb" replace />;

  return (
    <div className="mx-auto min-h-screen max-w-2xl p-4 lg:p-8">
      <SupportGroupNav member={member} />
      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <Card>
          <CardHeader><CardTitle>Welcome, {member.name}</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <InfoRow icon={Briefcase} label="Designation" value={member.designation} />
            <InfoRow icon={Phone} label="Phone" value={member.phone} />
            <InfoRow icon={CalendarClock} label="Member since" value={formatDate(member.created_at)} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
