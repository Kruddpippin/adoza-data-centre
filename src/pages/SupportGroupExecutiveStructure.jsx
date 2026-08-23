import { Navigate } from "react-router-dom";
import { Network, MapPin, Phone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMySupportGroupMembership, useExecutives } from "@/hooks/useSupportGroup";
import { SupportGroupNav } from "@/components/SupportGroupNav";
import { Card, CardHeader, CardTitle, CardContent, Spinner, ErrorState, EmptyState } from "@/components/ui";
import { EXECUTIVE_HIERARCHY_LEVELS } from "@/lib/utils";

function locationLine(exec) {
  return [exec.lga, exec.ward, exec.polling_unit].filter(Boolean).join(" · ");
}

export default function SupportGroupExecutiveStructure() {
  const { session, user, loading: authLoading } = useAuth();
  const {
    data: member, isLoading: memberLoading, isError: memberError, refetch: refetchMember,
  } = useMySupportGroupMembership(user?.id);
  const {
    data: executives, isLoading: execLoading, isError: execError, refetch: refetchExecutives,
  } = useExecutives();

  if (authLoading) return <Spinner className="min-h-screen" />;
  if (!session) return <Navigate to="/gyb2syb" replace />;
  // Not (yet) an approved member — send them back to see their registration status.
  if (!memberLoading && !memberError && !member) return <Navigate to="/gyb2syb" replace />;

  const isLoading = memberLoading || execLoading;
  const isError = memberError || execError;

  // Grouped in the fixed hierarchy order (top to bottom), not alphabetically or by
  // insertion order — an empty level is simply omitted rather than shown blank.
  const grouped = EXECUTIVE_HIERARCHY_LEVELS.map((level) => ({
    level,
    people: (executives ?? []).filter((e) => e.hierarchy === level),
  })).filter((g) => g.people.length > 0);

  return (
    <div className="mx-auto min-h-screen max-w-2xl p-4 lg:p-8">
      <SupportGroupNav member={member} />
      <div className="animate-fade-up mb-4">
        <h1 className="font-display text-xl font-bold tracking-tight lg:text-2xl">GYB2SYB DOOR2DOOR Executive Structure</h1>
      </div>
      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState onRetry={() => { refetchMember(); refetchExecutives(); }} />
      ) : !grouped.length ? (
        <EmptyState icon={Network} title="Not published yet" message="Executive structure will be published here soon." />
      ) : (
        <div className="space-y-4">
          {grouped.map(({ level, people }) => (
            <Card key={level} className="animate-fade-up">
              <CardHeader><CardTitle>{level}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {people.map((p) => {
                  const location = locationLine(p);
                  return (
                    <div key={p.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        {p.phone && (
                          <a href={`tel:${p.phone}`} className="mt-0.5 flex items-center gap-1 text-xs text-primary hover:underline">
                            <Phone className="h-3 w-3 shrink-0" aria-hidden /> {p.phone}
                          </a>
                        )}
                      </div>
                      {location && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" aria-hidden /> {location}
                        </p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
