import { useState } from "react";
import { ClipboardList, ChevronRight, Send } from "lucide-react";
import { useSurveyTemplates, useSurveyResponses, useSubmitSurveyResponse, useYouths } from "@/hooks/useData";
import { useAuth } from "@/context/AuthContext";
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Select, Textarea, Field, Spinner, ErrorState, EmptyState, Modal, Badge } from "@/components/ui";
import { formatDateTime, cn } from "@/lib/utils";

function SurveyField({ field, value, onChange }) {
  const common = { value: value ?? "", onChange: (e) => onChange(e.target.value) };
  if (field.type === "select") {
    return (
      <Select {...common}>
        <option value="">Select…</option>
        {(field.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
      </Select>
    );
  }
  if (field.type === "number") return <Input type="number" {...common} />;
  if (field.type === "textarea") return <Textarea rows={3} {...common} />;
  return <Input {...common} />;
}

export default function Surveys() {
  const { user } = useAuth();
  const { data: templates, isLoading, isError, refetch } = useSurveyTemplates();
  const [selected, setSelected] = useState(null);
  const { data: responses, isLoading: loadingResponses } = useSurveyResponses(selected?.id);
  const { data: youths = [] } = useYouths({});
  const submitResponse = useSubmitSurveyResponse();

  const [modalOpen, setModalOpen] = useState(false);
  const [answers, setAnswers] = useState({});
  const [youthId, setYouthId] = useState("");
  const [error, setError] = useState("");

  const openSubmit = () => {
    setAnswers({});
    setYouthId("");
    setError("");
    setModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await submitResponse.mutateAsync({
        template_id: selected.id,
        youth_id: youthId || null,
        respondent_id: user.id,
        data: answers,
      });
      setModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <div className="animate-fade-up">
        <h1 className="font-display text-xl font-bold tracking-tight lg:text-2xl">Surveys</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Field surveys and collected responses.</p>
      </div>

      {!templates?.length ? (
        <EmptyState icon={ClipboardList} title="No survey templates" message="An admin can create survey templates in the database." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Template list */}
          <div className="space-y-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t)}
                className={cn(
                  "card-lift w-full rounded-xl border bg-card p-4 text-left",
                  selected?.id === t.id && "border-primary ring-1 ring-primary"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{t.description}</p>
                <div className="mt-2 flex gap-1.5">
                  <Badge className="bg-muted text-muted-foreground">v{t.version}</Badge>
                  <Badge className={t.is_active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}>
                    {t.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </button>
            ))}
          </div>

          {/* Responses */}
          <div className="lg:col-span-2">
            {!selected ? (
              <EmptyState icon={ClipboardList} title="Select a survey" message="Choose a template to view or submit responses." />
            ) : (
              <Card className="animate-fade-in">
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>{selected.name} — responses</CardTitle>
                  {selected.is_active && (
                    <Button size="sm" onClick={openSubmit}>
                      <Send className="h-4 w-4" /> Submit response
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {loadingResponses ? (
                    <Spinner />
                  ) : !responses?.length ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">No responses yet.</p>
                  ) : (
                    <ul className="space-y-3">
                      {responses.map((r) => (
                        <li key={r.id} className="rounded-xl border p-4">
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                            <span>
                              {r.youth ? `${r.youth.first_name} ${r.youth.last_name}` : "General"} · by {r.respondent?.name}
                            </span>
                            <span>{formatDateTime(r.submitted_at)}</span>
                          </div>
                          <dl className="grid gap-2 sm:grid-cols-2">
                            {(selected.fields ?? []).map((f) => (
                              <div key={f.key}>
                                <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{f.label}</dt>
                                <dd className="text-sm">{String(r.data?.[f.key] ?? "—") || "—"}</dd>
                              </div>
                            ))}
                          </dl>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Submit — ${selected?.name ?? ""}`} wide>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="Linked youth (optional)">
            <Select value={youthId} onChange={(e) => setYouthId(e.target.value)}>
              <option value="">— None —</option>
              {youths.map((y) => <option key={y.id} value={y.id}>{y.first_name} {y.last_name}</option>)}
            </Select>
          </Field>
          {(selected?.fields ?? []).map((f) => (
            <Field key={f.key} label={f.label}>
              <SurveyField field={f} value={answers[f.key]} onChange={(v) => setAnswers((a) => ({ ...a, [f.key]: v }))} />
            </Field>
          ))}
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitResponse.isPending}>Submit</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
