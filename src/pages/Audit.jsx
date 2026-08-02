import { useState, useMemo } from "react";
import { Shield } from "lucide-react";
import { useAuditLog } from "@/hooks/useData";
import { Select, Badge, Spinner, ErrorState, EmptyState, Table, Th, Td } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

const ACTION_META = {
  insert: { label: "Created", cls: "bg-emerald-100 text-emerald-700" },
  update: { label: "Updated", cls: "bg-blue-100 text-blue-700" },
  delete: { label: "Deleted", cls: "bg-red-100 text-red-700" },
};

const ENTITY_LABELS = { youths: "Candidate", equipment: "Equipment", funding: "Funding" };

export default function Audit() {
  const { data: rows, isLoading, isError, refetch } = useAuditLog();
  const [entity, setEntity] = useState("");

  const filtered = useMemo(
    () => (rows ?? []).filter((r) => !entity || r.entity === entity),
    [rows, entity]
  );

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 animate-fade-up">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight lg:text-2xl">Audit Log</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Every change to candidates, equipment and funding is recorded automatically.</p>
        </div>
        <Select value={entity} onChange={(e) => setEntity(e.target.value)} className="w-44" aria-label="Filter by entity">
          <option value="">All entities</option>
          {Object.entries(ENTITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
      </div>

      {!filtered.length ? (
        <EmptyState icon={Shield} title="No audit entries" message="Activity will appear here as data changes." />
      ) : (
        <Table className="animate-fade-up">
          <thead>
            <tr>
              <Th>When</Th>
              <Th>Who</Th>
              <Th>Action</Th>
              <Th>Entity</Th>
              <Th>Record</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-muted/40">
                <Td className="whitespace-nowrap text-xs text-muted-foreground">{formatDateTime(r.created_at)}</Td>
                <Td className="text-sm">{r.actor?.name ?? "System"}</Td>
                <Td>
                  <Badge className={ACTION_META[r.action]?.cls ?? "bg-muted text-muted-foreground"}>
                    {ACTION_META[r.action]?.label ?? r.action}
                  </Badge>
                </Td>
                <Td>{ENTITY_LABELS[r.entity] ?? r.entity}</Td>
                <Td className="max-w-[280px] truncate text-xs text-muted-foreground">
                  {r.details?.first_name ? `${r.details.first_name} ${r.details.last_name ?? ""}` : r.details?.name ?? r.entity_id}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
