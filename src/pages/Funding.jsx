import { useState, useMemo } from "react";
import { Banknote, Plus, Pencil, Check, X, Landmark } from "lucide-react";
import { useFunding, useSaveFunding, useYouths } from "@/hooks/useData";
import { useAuth } from "@/context/AuthContext";
import { Button, Input, Select, Textarea, Field, Badge, ErrorState, EmptyState, Table, Th, Td, Modal, StatCard, TableSkeleton } from "@/components/ui";
import { FUNDING_META, formatNaira, formatDate } from "@/lib/utils";

const EMPTY = { beneficiary_id: "", amount_approved: "", notes: "" };

// Only the Benefits Committee (the role responsible for approving/disbursing grants) and
// the owner account may move a grant through its status workflow — admins who create grants
// cannot self-approve or self-disburse them.
const canDecideFunding = (role) => role === "committee" || role === "super_admin";

export default function Funding() {
  const { data: rows, isLoading, isError, refetch } = useFunding();
  const { data: youths = [] } = useYouths({ beneficiary: true, withBank: true });
  const save = useSaveFunding();
  const { role } = useAuth();
  const canDecide = canDecideFunding(role);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [decisionError, setDecisionError] = useState("");

  const selectedYouth = useMemo(
    () => youths.find((y) => y.id === form.beneficiary_id) ?? null,
    [youths, form.beneficiary_id]
  );
  const selectedBank = selectedYouth?.youth_bank_details ?? null;

  const totals = useMemo(() => {
    const list = rows ?? [];
    const sum = (status) => list.filter((r) => r.status === status).reduce((s, r) => s + Number(r.amount_approved || 0), 0);
    return { disbursed: sum("disbursed"), approved: sum("approved"), pending: sum("pending") };
  }, [rows]);

  const editingRow = editing && editing !== "new" ? rows?.find((r) => r.id === editing) : null;

  const openNew = () => { setForm(EMPTY); setEditing("new"); setError(""); };
  const openEdit = (r) => {
    setForm({
      beneficiary_id: r.beneficiary_id, amount_approved: r.amount_approved,
      notes: r.notes ?? "",
    });
    setEditing(r.id);
    setError("");
    setDecisionError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.beneficiary_id) { setError("Select a beneficiary"); return; }
    if (!form.amount_approved || Number(form.amount_approved) <= 0) { setError("Enter a valid amount"); return; }
    if (editing === "new" && !selectedBank) {
      setError("This beneficiary has not submitted banking details yet — they must add these from their own portal before a grant can be created.");
      return;
    }
    const payload = {
      beneficiary_id: form.beneficiary_id,
      amount_approved: Number(form.amount_approved),
      bank_name: selectedBank?.bank_name ?? editingRow?.bank_name ?? null,
      account_number: selectedBank?.account_number ?? editingRow?.account_number ?? null,
      notes: form.notes || null,
    };
    try {
      if (editing === "new") {
        // New grants always start pending — only the Benefits Committee can move them forward.
        await save.mutateAsync({ ...payload, status: "pending", disbursement_date: null });
      } else {
        await save.mutateAsync({ id: editing, ...payload });
      }
      setEditing(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const decide = async (status) => {
    setDecisionError("");
    try {
      await save.mutateAsync({
        id: editing,
        status,
        disbursement_date: status === "disbursed" ? new Date().toISOString() : editingRow?.disbursement_date ?? null,
      });
      setEditing(null);
    } catch (err) {
      setDecisionError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 animate-fade-up">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight lg:text-2xl">Funding</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Grants approved and disbursed to beneficiaries.</p>
        </div>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4" /> New grant
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard className="animate-fade-up stagger-1" icon={Banknote} label="Disbursed" value={formatNaira(totals.disbursed)} tone="emerald" />
        <StatCard className="animate-fade-up stagger-2" icon={Banknote} label="Approved (awaiting)" value={formatNaira(totals.approved)} tone="blue" />
        <StatCard className="animate-fade-up stagger-3" icon={Banknote} label="Pending review" value={formatNaira(totals.pending)} tone="amber" />
      </div>

      {isLoading ? (
        <TableSkeleton columns={6} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !rows?.length ? (
        <EmptyState icon={Banknote} title="No funding records" message="Create the first grant for an approved beneficiary." />
      ) : (
        <Table className="animate-fade-up">
          <thead>
            <tr>
              <Th>Beneficiary</Th>
              <Th>Amount</Th>
              <Th>Bank</Th>
              <Th>Status</Th>
              <Th>Disbursed</Th>
              <Th> </Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-muted/40">
                <Td className="font-medium">
                  {r.beneficiary ? `${r.beneficiary.first_name} ${r.beneficiary.last_name}` : "—"}
                  <span className="block text-xs font-normal text-muted-foreground">{r.beneficiary?.lga}</span>
                </Td>
                <Td className="tabular font-semibold">{formatNaira(r.amount_approved)}</Td>
                <Td className="text-xs text-muted-foreground">
                  {r.bank_name ?? "—"}
                  {r.account_number && <span className="block">{r.account_number}</span>}
                </Td>
                <Td>
                  <Badge className={FUNDING_META[r.status]?.cls}>{FUNDING_META[r.status]?.label}</Badge>
                </Td>
                <Td className="text-xs text-muted-foreground">{formatDate(r.disbursement_date)}</Td>
                <Td>
                  <Button variant="ghost" size="icon" aria-label="Edit grant" onClick={() => openEdit(r)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? "New grant" : "Edit grant"}>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="Beneficiary" required>
            <Select
              value={form.beneficiary_id}
              disabled={editing !== "new"}
              onChange={(e) => setForm({ ...form, beneficiary_id: e.target.value })}
            >
              <option value="">Select beneficiary…</option>
              {youths.map((y) => <option key={y.id} value={y.id}>{y.first_name} {y.last_name}</option>)}
            </Select>
          </Field>

          <Field label="Amount (NGN)" required>
            <Input type="number" min="0" value={form.amount_approved} onChange={(e) => setForm({ ...form, amount_approved: e.target.value })} />
          </Field>

          <Field label="Banking details">
            {selectedBank ? (
              <div className="flex items-start gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium">{selectedBank.bank_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedBank.account_number} · {selectedBank.account_name}</p>
                </div>
              </div>
            ) : editing === "new" && !form.beneficiary_id ? (
              <p className="text-xs text-muted-foreground">Select a beneficiary to load their banking details.</p>
            ) : (
              <p className="text-xs font-medium text-amber-600">
                This beneficiary has not submitted banking details yet.
              </p>
            )}
          </Field>

          {editingRow && (
            <Field label="Status">
              <Badge className={FUNDING_META[editingRow.status]?.cls}>{FUNDING_META[editingRow.status]?.label}</Badge>
              <p className="mt-1 text-xs text-muted-foreground">
                Set by the Benefits Committee on approval/disbursement — not editable here.
              </p>
            </Field>
          )}

          <Field label="Notes">
            <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" loading={save.isPending}>Save</Button>
          </div>

          {editingRow && canDecide && (
            <div className="space-y-2 border-t pt-4">
              <p className="text-xs font-medium text-muted-foreground">Benefits Committee decision</p>
              {decisionError && <p className="text-sm font-medium text-destructive">{decisionError}</p>}
              <div className="flex flex-wrap gap-2">
                {editingRow.status === "pending" && (
                  <>
                    <Button type="button" size="sm" onClick={() => decide("approved")} loading={save.isPending}>
                      <Check className="h-4 w-4" /> Approve
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => decide("returned")} loading={save.isPending}>
                      <X className="h-4 w-4" /> Return for review
                    </Button>
                  </>
                )}
                {editingRow.status === "approved" && (
                  <>
                    <Button type="button" size="sm" onClick={() => decide("disbursed")} loading={save.isPending}>
                      <Check className="h-4 w-4" /> Mark disbursed
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => decide("failed")} loading={save.isPending}>
                      <X className="h-4 w-4" /> Mark failed
                    </Button>
                  </>
                )}
                {(editingRow.status === "returned" || editingRow.status === "failed") && (
                  <Button type="button" size="sm" onClick={() => decide("pending")} loading={save.isPending}>
                    Resubmit for review
                  </Button>
                )}
              </div>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
