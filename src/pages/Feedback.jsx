import { useState } from "react";
import { Inbox } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useFeedbackMessages, useUpdateFeedbackStatus } from "@/hooks/useData";
import { Select, Badge, Spinner, ErrorState, EmptyState, Table, Th, Td, Modal, Button } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

const STATUS_META = {
  new: { label: "New", cls: "bg-amber-100 text-amber-700" },
  in_progress: { label: "In progress", cls: "bg-blue-100 text-blue-700" },
  resolved: { label: "Resolved", cls: "bg-emerald-100 text-emerald-700" },
};

const CATEGORY_LABELS = {
  general: "General question",
  registration: "Registration",
  verification: "Verification status",
  funding: "Funding / payment",
  equipment: "Equipment",
  training: "Training",
  technical: "Technical problem",
  other: "Other",
};

function MessageModal({ message, onClose, onUpdateStatus, updating }) {
  if (!message) return null;
  return (
    <Modal open={!!message} onClose={onClose} title={message.name} centered>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={STATUS_META[message.status]?.cls}>{STATUS_META[message.status]?.label ?? message.status}</Badge>
          <Badge className="bg-muted text-muted-foreground">{CATEGORY_LABELS[message.category] ?? message.category}</Badge>
        </div>
        <div className="space-y-1 text-sm">
          <p><span className="text-muted-foreground">Email:</span> <a href={`mailto:${message.email}`} className="underline">{message.email}</a></p>
          {message.phone && <p><span className="text-muted-foreground">Phone:</span> {message.phone}</p>}
          <p className="text-xs text-muted-foreground">Submitted {formatDateTime(message.created_at)}</p>
        </div>
        <p className="whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm">{message.message}</p>
        {message.status === "resolved" && message.resolver?.name && (
          <p className="text-xs text-muted-foreground">Resolved by {message.resolver.name}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {message.status !== "in_progress" && (
            <Button variant="outline" loading={updating} onClick={() => onUpdateStatus(message.id, "in_progress")}>
              Mark in progress
            </Button>
          )}
          {message.status !== "resolved" && (
            <Button loading={updating} onClick={() => onUpdateStatus(message.id, "resolved")}>
              Mark resolved
            </Button>
          )}
          {message.status !== "new" && (
            <Button variant="outline" loading={updating} onClick={() => onUpdateStatus(message.id, "new")}>
              Reopen
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default function Feedback() {
  const { profile } = useAuth();
  const { data: rows, isLoading, isError, refetch } = useFeedbackMessages();
  const updateStatus = useUpdateFeedbackStatus();
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = (rows ?? []).filter((r) => !statusFilter || r.status === statusFilter);

  const handleUpdateStatus = async (id, status) => {
    const updated = await updateStatus.mutateAsync({ id, status, resolvedBy: profile?.id });
    setSelected((cur) => (cur && cur.id === id ? { ...cur, ...updated } : cur));
  };

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 animate-fade-up">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight lg:text-2xl">Feedback &amp; Support</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Messages submitted through the public Contact page.</p>
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-44" aria-label="Filter by status">
          <option value="">All statuses</option>
          {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </Select>
      </div>

      {!filtered.length ? (
        <EmptyState icon={Inbox} title="No messages" message="Feedback and support requests will appear here." />
      ) : (
        <Table className="animate-fade-up">
          <thead>
            <tr>
              <Th>When</Th>
              <Th>From</Th>
              <Th>Category</Th>
              <Th>Message</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="cursor-pointer transition-colors hover:bg-muted/40" onClick={() => setSelected(r)}>
                <Td className="whitespace-nowrap text-xs text-muted-foreground">{formatDateTime(r.created_at)}</Td>
                <Td className="text-sm">
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.email}</p>
                </Td>
                <Td className="text-sm">{CATEGORY_LABELS[r.category] ?? r.category}</Td>
                <Td className="max-w-[320px] truncate text-xs text-muted-foreground">{r.message}</Td>
                <Td>
                  <Badge className={STATUS_META[r.status]?.cls}>{STATUS_META[r.status]?.label ?? r.status}</Badge>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <MessageModal
        message={selected}
        onClose={() => setSelected(null)}
        onUpdateStatus={handleUpdateStatus}
        updating={updateStatus.isPending}
      />
    </div>
  );
}
