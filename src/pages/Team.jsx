import { useState } from "react";
import { UserCog } from "lucide-react";
import { useProfiles, useUpdateProfile } from "@/hooks/useData";
import { useAuth } from "@/context/AuthContext";
import { Select, Badge, Spinner, ErrorState, Table, Th, Td } from "@/components/ui";
import { ROLES, ROLE_LABELS, ROLE_COLORS, formatDate, cn } from "@/lib/utils";

const STATUS_META = {
  active: { label: "Active", cls: "bg-emerald-100 text-emerald-700" },
  suspended: { label: "Suspended", cls: "bg-amber-100 text-amber-700" },
  deactivated: { label: "Deactivated", cls: "bg-red-100 text-red-700" },
};

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
          Programme staff accounts, roles and access. New staff sign up with email and default to the Enumerator role.
        </p>
      </div>

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
                      {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
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
