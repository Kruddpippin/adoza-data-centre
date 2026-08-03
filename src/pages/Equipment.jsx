import { useState } from "react";
import { Package, Plus, Pencil } from "lucide-react";
import { useEquipment, useSaveEquipment, useYouths } from "@/hooks/useData";
import { Button, Input, Select, Textarea, Field, Badge, ErrorState, EmptyState, Table, Th, Td, Modal, TableSkeleton } from "@/components/ui";
import { EQUIPMENT_META, formatDate } from "@/lib/utils";

const EMPTY = { name: "", serial_number: "", category: "General", status: "available", assigned_to: "", notes: "" };

export default function Equipment() {
  const { data: items, isLoading, isError, refetch } = useEquipment();
  const { data: youths = [] } = useYouths({ beneficiary: true });
  const save = useSaveEquipment();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  const openNew = () => { setForm(EMPTY); setEditing("new"); setError(""); };
  const openEdit = (item) => {
    setForm({
      name: item.name, serial_number: item.serial_number ?? "", category: item.category,
      status: item.status, assigned_to: item.assigned_to ?? "", notes: item.notes ?? "",
    });
    setEditing(item.id);
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required"); return; }
    const payload = {
      ...form,
      serial_number: form.serial_number || null,
      assigned_to: form.assigned_to || null,
      notes: form.notes || null,
      assigned_date: form.assigned_to && form.status === "assigned" ? new Date().toISOString() : undefined,
      delivered_date: form.status === "delivered" ? new Date().toISOString() : undefined,
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
          <h1 className="font-display text-xl font-bold tracking-tight lg:text-2xl">Equipment</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Inventory, assignment and delivery tracking.</p>
        </div>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4" /> Add equipment
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton columns={7} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !items?.length ? (
        <EmptyState icon={Package} title="No equipment yet" message="Add items to start tracking inventory." />
      ) : (
        <Table className="animate-fade-up">
          <thead>
            <tr>
              <Th>Item</Th>
              <Th>Serial no.</Th>
              <Th>Category</Th>
              <Th>Status</Th>
              <Th>Assigned to</Th>
              <Th>Dates</Th>
              <Th> </Th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="transition-colors hover:bg-muted/40">
                <Td className="font-medium">{it.name}</Td>
                <Td className="text-xs text-muted-foreground">{it.serial_number ?? "—"}</Td>
                <Td>{it.category}</Td>
                <Td>
                  <Badge className={EQUIPMENT_META[it.status]?.cls}>{EQUIPMENT_META[it.status]?.label}</Badge>
                </Td>
                <Td>
                  {it.assigned_youth ? `${it.assigned_youth.first_name} ${it.assigned_youth.last_name}` : "—"}
                </Td>
                <Td className="text-xs text-muted-foreground">
                  {it.assigned_date && <span className="block">Assigned {formatDate(it.assigned_date)}</span>}
                  {it.delivered_date && <span className="block">Delivered {formatDate(it.delivered_date)}</span>}
                  {!it.assigned_date && !it.delivered_date && "—"}
                </Td>
                <Td>
                  <Button variant="ghost" size="icon" aria-label={`Edit ${it.name}`} onClick={() => openEdit(it)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? "Add equipment" : "Edit equipment"}>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="Item name" required error={error}>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Serial number">
              <Input value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} />
            </Field>
            <Field label="Category">
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {Object.entries(EQUIPMENT_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </Select>
            </Field>
            <Field label="Assign to beneficiary">
              <Select value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
                <option value="">— Unassigned —</option>
                {youths.map((y) => (
                  <option key={y.id} value={y.id}>{y.first_name} {y.last_name}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Notes">
            <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" loading={save.isPending}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
