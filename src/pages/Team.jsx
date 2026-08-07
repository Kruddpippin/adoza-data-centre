import { useState } from "react";
import { UserCog, Check, X, User as UserIcon, MapPin } from "lucide-react";
import {
  useProfiles, useUpdateProfile, usePendingApplications, useApproveApplication, useRejectApplication,
} from "@/hooks/useData";
import { useAuth } from "@/context/AuthContext";
import { Button, Select, Badge, Spinner, ErrorState, Table, Th, Td, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { ROLES, ROLE_LABELS, ROLE_COLORS, OWNER_EMAIL, formatDate, cn } from "@/lib/utils";

const STATUS_META = {
  active: { label: "Active", cls: "bg-emerald-100 text-emerald-700" },
  suspended: { label: "Suspended", cls: "bg-amber-100 text-amber-700" },
  deactivated: { label: "Deactivated", cls: "bg-red-100 text-red-700" },
};

function PendingApplications() {
  const { data: applications, isLoading, isError, refetch } = usePendingApplications();
  const approve = useApproveApplication();
  const reject = useRejectApplication();
  const [error, setError] = useState("");
  const [actingOn, setActingOn] = useState(null);

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (!applications?.length) return null;

  const act = async (mutation, id) => {
    setError("");
    setActingOn(id);
    try {
      await mutation.mutateAsync(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setActingOn(null);
    }
  };

  return (
    <Card className="animate-fade-up">
      <CardHeader><CardTitle>Pending applications ({applications.length})</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        {applications.map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              {a.photo_url ? (
                <img src={a.photo_url} alt={a.name} className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <UserIcon className="h-4 w-4 text-muted-foreground" aria-hidden />
                </div>
              )}
              <div>
                <p className="text-sm font-medium">{a.name}</p>
                <p className="text-xs text-muted-foreground">
                  {a.email} · applying for <span className="font-medium">{ROLE_LABELS[a.applied_role]}</span> · {formatDate(a.created_at)}
                </p>
                {a.latitude != null && a.longitude != null && (
                  <a
                    href={`https://www.google.com/maps?q=${a.latitude},${a.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                  >
                    <MapPin className="h-3 w-3" /> View location
                  </a>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                loading={actingOn === a.id && reject.isPending}
                disabled={actingOn === a.id}
                onClick={() => act(reject, a.id)}
              >
                <X className="h-4 w-4" /> Reject
              </Button>
              <Button
                size="sm"
                loading={actingOn === a.id && approve.isPending}
                disabled={actingOn === a.id}
                onClick={() => act(approve, a.id)}
              >
                <Check className="h-4 w-4" /> Approve
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function Team() {
  const { user } = useAuth();
  const { data: profiles, isLoading, isError, refetch } = useProfiles();
  const update = useUpdateProfile();
  const [error, setError] = useState("");

  const change = async (id, patch) => {
    setError("");
    try {
      await update.mutateAsync({ id, ...patch });
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <div className="animate-fade-up">
        <h1 className="font-display text-xl font-bold tracking-tight lg:text-2xl">Team</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Programme staff accounts, roles and access. Prospective staff apply from the login page and are approved here.
        </p>
      </div>

      <PendingApplications />

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <Table className="animate-fade-up">
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            <Th>Joined</Th>
          </tr>
        </thead>
        <tbody>
          {(profiles ?? []).map((p) => {
            const isSelf = p.id === user?.id;
            return (
              <tr key={p.id} className="transition-colors hover:bg-muted/40">
                <Td className="font-medium">
                  {p.name} {isSelf && <span className="text-xs text-muted-foreground">(you)</span>}
                </Td>
                <Td className="text-xs text-muted-foreground">{p.email}</Td>
                <Td>
                  {isSelf ? (
                    <Badge className={cn(ROLE_COLORS[p.role])}>{ROLE_LABELS[p.role]}</Badge>
                  ) : (
                    <Select
                      className="h-8 w-40 text-xs"
                      value={p.role}
                      onChange={(e) => change(p.id, { role: e.target.value })}
                      aria-label={`Role for ${p.name}`}
                    >
                      {/* Super Admin is reserved for the owner account (precious.op2013@gmail.com)
                          and isn't assignable to anyone else from this dropdown. */}
                      {ROLES.filter((r) => r !== "super_admin" || p.email === OWNER_EMAIL).map((r) => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                      ))}
                    </Select>
                  )}
                </Td>
                <Td>
                  {isSelf ? (
                    <Badge className={STATUS_META[p.status]?.cls}>{STATUS_META[p.status]?.label}</Badge>
                  ) : (
                    <Select
                      className="h-8 w-36 text-xs"
                      value={p.status}
                      onChange={(e) => change(p.id, { status: e.target.value })}
                      aria-label={`Status for ${p.name}`}
                    >
                      {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </Select>
                  )}
                </Td>
                <Td className="text-xs text-muted-foreground">{formatDate(p.created_at)}</Td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <UserCog className="h-3.5 w-3.5" /> Suspended or deactivated staff lose data access immediately (enforced by Row Level Security).
      </p>
    </div>
  );
}
