import { useState, useMemo } from "react";
import { Banknote, Plus, Pencil } from "lucide-react";
import { useFunding, useSaveFunding, useYouths } from "@/hooks/useData";
import { Button, Input, Select, Textarea, Field, Badge, ErrorState, EmptyState, Table, Th, Td, Modal, StatCard, TableSkeleton } from "@/components/ui";
import { FUNDING_META, formatNaira, formatDate } from "@/lib/utils";

const EMPTY = { beneficiary_id: "", amount_approved: "", bank_name: "", account_number: "", status: "pending", notes: "" };

export default function Funding() {
  const { data: rows, isLoading, isError, refetch } = useFunding();
  const { data: youths = [] } = useYouths({ beneficiary: true });
  const save = useSaveFunding();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  const totals = useMemo(() => {
    const list = rows ?? [];
    const sum = (status) => list.filter((r) => r.status === status).reduce((s, r) => s + Number(r.amount_approved || 0), 0);
    return { disbursed: sum("disbursed"), approved: sum("approved"), pending: sum("pending") };
  }, [rows]);

  const openNew = () => { setForm(EMPTY); setEditing("new"); setError(""); };
  const openEdit = (r) => {
    setForm({
      beneficiary_id: r.beneficiary_id, amount_approved: r.amount_approved,
      bank_name: r.bank_name ?? "", account_number: r.account_number ?? "",
      status: r.status, notes: r.notes ?? "",
    });
    setEditing(r.id);
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.beneficiary_id) { setError("Select a beneficiary"); return; }
    if (!form.amount_approved || Number(form.amount_approved) <= 0) { setError("Enter a valid amount"); return; }
    const payload = {
      ...form,
      amount_approved: Number(form.amount_approved),
      bank_name: form.bank_name || null,
      account_number: form.account_number || null,
      notes: form.notes || null,
      disbursement_date: form.status === "disbursed" ? new Date().toISOString() : null,
    };
    try {
      await save.mutateAsync(editing === "new" ? payload : { id: editing, ...payload });
      setEditing(null);
    } catch (err) {
      setError(err.message);
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
            <Select value={form.beneficiary_id} onChange={(e) => setForm({ ...form, beneficiary_id: e.target.value })}>
              <option value="">Select beneficiary…</option>
              {youths.map((y) => <option key={y.id} value={y.id}>{y.first_name} {y.last_name}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount (NGN)" required>
              <Input type="number" min="0" value={form.amount_approved} onChange={(e) => setForm({ ...form, amount_approved: e.target.value })} />
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {Object.entries(FUNDING_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bank name">
              <Input value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} />
            </Field>
            <Field label="Account number">
              <Input value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} inputMode="numeric" />
            </Field>
          </div>
          <Field label="Notes">
            <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" loading={save.isPending}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
