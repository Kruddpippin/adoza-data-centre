import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Check, X, User as UserIcon, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  usePendingSupportGroupApplications, useApproveSupportGroupApplication, useRejectSupportGroupApplication,
  useSupportGroupMembers, useUpdateSupportGroupMember, useExecutiveStructure, useUpdateExecutiveStructure,
} from "@/hooks/useSupportGroup";
import {
  Button, Select, Textarea, Spinner, ErrorState, Table, Th, Td, Card, CardHeader, CardTitle, CardContent,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";

const MEMBER_STATUS_META = {
  active: { label: "Active" },
  suspended: { label: "Suspended" },
};

function PendingSupportGroupApplications() {
  const { data: applications, isLoading, isError, refetch } = usePendingSupportGroupApplications();
  const approve = useApproveSupportGroupApplication();
  const reject = useRejectSupportGroupApplication();
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
      <CardHeader><CardTitle>Pending registrations ({applications.length})</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        {applications.map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <UserIcon className="h-4 w-4 text-muted-foreground" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-medium">{a.name}</p>
                <p className="text-xs text-muted-foreground">
                  {a.email} · {a.phone} · <span className="font-medium">{a.designation}</span> · {formatDate(a.created_at)}
                </p>
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

function MemberRoster() {
  const { data: members, isLoading, isError, refetch } = useSupportGroupMembers();
  const update = useUpdateSupportGroupMember();
  const [error, setError] = useState("");

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const change = async (id, patch) => {
    setError("");
    try {
      await update.mutateAsync({ id, ...patch });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-2">
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      <Table className="animate-fade-up">
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Phone</Th>
            <Th>Designation</Th>
            <Th>Status</Th>
            <Th>Joined</Th>
          </tr>
        </thead>
        <tbody>
          {(members ?? []).map((m) => (
            <tr key={m.id} className="transition-colors hover:bg-muted/40">
              <Td className="font-medium">{m.name}</Td>
              <Td className="text-xs text-muted-foreground">{m.phone}</Td>
              <Td className="text-xs text-muted-foreground">{m.designation}</Td>
              <Td>
                <Select
                  className="h-8 w-36 text-xs"
                  value={m.status}
                  onChange={(e) => change(m.id, { status: e.target.value })}
                  aria-label={`Status for ${m.name}`}
                >
                  {Object.entries(MEMBER_STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </Select>
              </Td>
              <Td className="text-xs text-muted-foreground">{formatDate(m.created_at)}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
      {!members?.length && <p className="py-6 text-center text-sm text-muted-foreground">No support group members yet.</p>}
    </div>
  );
}

function ExecutiveStructureEditor() {
  const { user } = useAuth();
  const { data: structure, isLoading, isError, refetch } = useExecutiveStructure();
  const update = useUpdateExecutiveStructure();
  const [content, setContent] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (structure && !initialized) {
      setContent(structure.content ?? "");
      setInitialized(true);
    }
  }, [structure, initialized]);

  const handleSave = async () => {
    setError("");
    setSaved(false);
    try {
      await update.mutateAsync({ content, updatedBy: user.id });
      setSaved(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>GYB2SYB DOOR2DOOR Executive Structure</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          This is what support group members see on their "GYB2SYB DOOR2DOOR Executive Structure" page.
        </p>
        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : (
          <>
            <Textarea
              rows={10}
              value={content}
              onChange={(e) => { setContent(e.target.value); setSaved(false); }}
              placeholder="## Leadership&#10;- Coordinator: …&#10;- Media Team Lead: …"
            />
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <div className="flex items-center gap-3">
              <Button onClick={handleSave} loading={update.isPending}>Save</Button>
              {saved && !update.isPending && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Saved.
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function SupportGroupAdmin() {
  const { session, loading: authLoading } = useAuth();

  if (authLoading) return <Spinner className="min-h-screen" />;
  // Role gating is handled by the route wrapper — this just guards against a lost
  // session, same as every other page.
  if (!session) return <Navigate to="/login?portal=staff" replace />;

  return (
    <div className="space-y-4">
      <div className="animate-fade-up">
        <h1 className="font-display text-xl font-bold tracking-tight lg:text-2xl">GYB2SYB Support Integration Group</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Review volunteer registrations, manage the member roster, and publish the executive structure.
        </p>
      </div>

      <PendingSupportGroupApplications />

      <MemberRoster />

      <ExecutiveStructureEditor />
    </div>
  );
}
