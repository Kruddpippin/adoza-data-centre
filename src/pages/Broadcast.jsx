import { useState } from "react";
import { Megaphone, CheckCircle2 } from "lucide-react";
import { useBroadcastNotification } from "@/hooks/useData";
import { Button, Input, Select, Textarea, Field, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";

const TYPE_LABELS = { info: "Info", success: "Success", warning: "Warning" };

export default function Broadcast() {
  const broadcast = useBroadcastNotification();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [errors, setErrors] = useState({});
  const [sentCount, setSentCount] = useState(null);

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = "Required";
    if (!message.trim()) e.message = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setSentCount(null);
    if (!validate()) return;
    try {
      const count = await broadcast.mutateAsync({ title: title.trim(), message: message.trim(), type });
      setSentCount(count);
      setTitle("");
      setMessage("");
      setType("info");
    } catch (err) {
      setErrors((prev) => ({ ...prev, _root: err.message }));
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="animate-fade-up">
        <h1 className="font-display text-xl font-bold tracking-tight lg:text-2xl">Broadcast</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Send a notification to every staff member and every registered candidate at once.
        </p>
      </div>

      <Card className="animate-fade-up">
        <CardHeader><CardTitle>Compose message</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4" noValidate>
            <Field label="Title" required error={errors.title}>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Programme update" />
            </Field>
            <Field label="Message" required error={errors.message}>
              <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What do you want everyone to know?" />
            </Field>
            <Field label="Type">
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </Field>

            {errors._root && <p className="text-sm font-medium text-destructive">{errors._root}</p>}
            {sentCount != null && (
              <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> Sent to {sentCount} {sentCount === 1 ? "person" : "people"}.
              </p>
            )}

            <Button type="submit" className="w-full" loading={broadcast.isPending}>
              <Megaphone className="h-4 w-4" /> Send broadcast
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
