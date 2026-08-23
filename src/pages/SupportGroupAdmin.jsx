import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Check, X, User as UserIcon, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  usePendingSupportGroupApplications, useApproveSupportGroupApplication, useRejectSupportGroupApplication,
  useSupportGroupMembers, useUpdateSupportGroupMember,
  useExecutives, useAddExecutive, useAddExecutivesBulk, useDeleteExecutive,
} from "@/hooks/useSupportGroup";
import {
  Button, Select, Input, Textarea, Field, Spinner, ErrorState, Table, Th, Td, Card, CardHeader, CardTitle, CardContent,
} from "@/components/ui";
import { formatDate, KOGI_LGAS, KOGI_WARDS_BY_LGA, EXECUTIVE_HIERARCHY_LEVELS } from "@/lib/utils";

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

function ExecutiveEntryForm() {
  const { user } = useAuth();
  const addOne = useAddExecutive();
  const addBulk = useAddExecutivesBulk();
  const [mode, setMode] = useState("single"); // single | bulk
  const [hierarchy, setHierarchy] = useState(EXECUTIVE_HIERARCHY_LEVELS[0]);
  const [lga, setLga] = useState("");
  const [ward, setWard] = useState("");
  const [pollingUnit, setPollingUnit] = useState("");
  const [name, setName] = useState("");
  const [names, setNames] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(null);

  const wardOptions = KOGI_WARDS_BY_LGA[lga] ?? [];

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setSaved(null);
  };

  const setLgaAndResetWard = (e) => {
    setLga(e.target.value);
    setWard("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(null);

    // LGA/ward/polling unit are deliberately optional — a Central Committee entry has
    // no meaningful geography, unlike a Ward Coordinator or Polling Contact.
    const base = {
      hierarchy,
      lga: lga || null,
      ward: ward || null,
      polling_unit: pollingUnit.trim() || null,
      created_by: user.id,
    };

    try {
      if (mode === "single") {
        if (!name.trim()) {
          setError("Enter a name.");
          return;
        }
        await addOne.mutateAsync({ ...base, name: name.trim() });
        setName("");
        setSaved(1);
      } else {
        const nameList = names.split("\n").map((n) => n.trim()).filter(Boolean);
        if (!nameList.length) {
          setError("Enter at least one name — one per line.");
          return;
        }
        await addBulk.mutateAsync(nameList.map((n) => ({ ...base, name: n })));
        setNames("");
        setSaved(nameList.length);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const saving = addOne.isPending || addBulk.isPending;

  return (
    <Card>
      <CardHeader><CardTitle>Add to executive structure</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button type="button" size="sm" variant={mode === "single" ? "default" : "outline"} onClick={() => switchMode("single")}>
            Single entry
          </Button>
          <Button type="button" size="sm" variant={mode === "bulk" ? "default" : "outline"} onClick={() => switchMode("bulk")}>
            Bulk entry
          </Button>
        </div>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hierarchy" required>
              <Select value={hierarchy} onChange={(e) => setHierarchy(e.target.value)}>
                {EXECUTIVE_HIERARCHY_LEVELS.map((h) => <option key={h} value={h}>{h}</option>)}
              </Select>
            </Field>
            <Field label="Polling unit" hint="Entered manually — no fixed list.">
              <Input value={pollingUnit} onChange={(e) => setPollingUnit(e.target.value)} placeholder="e.g. Community Primary School I" />
            </Field>
            <Field label="LGA">
              <Select value={lga} onChange={setLgaAndResetWard}>
                <option value="">Select LGA…</option>
                {KOGI_LGAS.map((l) => <option key={l} value={l}>{l}</option>)}
              </Select>
            </Field>
            <Field label="Ward">
              <Select value={ward} onChange={(e) => setWard(e.target.value)} disabled={!lga}>
                <option value="">{lga ? "Select ward…" : "Select LGA first…"}</option>
                {wardOptions.map((w) => <option key={w} value={w}>{w}</option>)}
              </Select>
            </Field>
          </div>

          {mode === "single" ? (
            <Field label="Name" required>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            </Field>
          ) : (
            <Field label="Names" required hint="One name per line — all of them get this same hierarchy, LGA, ward and polling unit.">
              <Textarea rows={6} value={names} onChange={(e) => setNames(e.target.value)} placeholder={"Musa Adeiza\nGrace Okafor\nIbrahim Suleiman"} />
            </Field>
          )}

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          <div className="flex items-center gap-3">
            <Button type="submit" loading={saving}>
              <Plus className="h-4 w-4" /> {mode === "single" ? "Add" : "Add all"}
            </Button>
            {saved != null && !saving && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Added {saved} {saved === 1 ? "person" : "people"}.
              </p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ExecutiveList() {
  const { data: executives, isLoading, isError, refetch } = useExecutives();
  const del = useDeleteExecutive();
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const remove = async (id) => {
    setError("");
    setDeletingId(id);
    try {
      await del.mutateAsync(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const grouped = EXECUTIVE_HIERARCHY_LEVELS.map((level) => ({
    level,
    people: (executives ?? []).filter((e) => e.hierarchy === level),
  })).filter((g) => g.people.length > 0);

  return (
    <Card>
      <CardHeader><CardTitle>Current structure ({executives?.length ?? 0})</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        {!grouped.length ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Nothing added yet.</p>
        ) : (
          grouped.map(({ level, people }) => (
            <div key={level}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {level} ({people.length})
              </p>
              <Table>
                <thead>
                  <tr>
                    <Th>Name</Th>
                    <Th>LGA</Th>
                    <Th>Ward</Th>
                    <Th>Polling unit</Th>
                    <Th> </Th>
                  </tr>
                </thead>
                <tbody>
                  {people.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-muted/40">
                      <Td className="font-medium">{p.name}</Td>
                      <Td className="text-xs text-muted-foreground">{p.lga || "—"}</Td>
                      <Td className="text-xs text-muted-foreground">{p.ward || "—"}</Td>
                      <Td className="text-xs text-muted-foreground">{p.polling_unit || "—"}</Td>
                      <Td>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove ${p.name}`}
                          loading={deletingId === p.id}
                          onClick={() => remove(p.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ))
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

      <ExecutiveEntryForm />

      <ExecutiveList />
    </div>
  );
}
