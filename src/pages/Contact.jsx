import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, MessageCircle } from "lucide-react";
import { Footer } from "@/components/Footer";
import { useSubmitFeedback } from "@/hooks/useData";
import { Button, Input, Select, Textarea, Field, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";

const CATEGORY_LABELS = {
  general: "General question",
  registration: "Registration",
  verification: "Verification status",
  funding: "Funding / payment",
  equipment: "Equipment",
  training: "Training",
  technical: "Technical problem with the site or app",
  other: "Other",
};

const EMPTY = { name: "", email: "", phone: "", category: "general", message: "" };

export default function Contact() {
  const submit = useSubmitFeedback();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = "Enter a valid email address";
    if (!form.message.trim()) e.message = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await submit.mutateAsync({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        category: form.category,
        message: form.message.trim(),
      });
      setSent(true);
      setForm(EMPTY);
    } catch (err) {
      setErrors((prev) => ({ ...prev, _root: err.message }));
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="ADOZA Data Centre home">
            <img
              src="/kogi-logo.png"
              alt="ADOZA Data Centre"
              width={36}
              height={36}
              decoding="async"
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
            <p className="font-display truncate text-sm font-bold tracking-tight sm:text-base">ADOZA Data Centre</p>
          </Link>
          <Link to="/" className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-xl px-4 py-8 sm:py-10 lg:px-8">
          <h1 className="font-display animate-fade-up text-2xl font-bold tracking-tight sm:text-3xl">
            Contact &amp; Feedback
          </h1>
          <p className="animate-fade-up stagger-1 mt-2 text-sm text-muted-foreground sm:text-base">
            Having a problem with your registration, or have a question about the programme? Send us a message
            and a member of the programme team will get back to you.
          </p>

          <Card className="animate-fade-up stagger-2 mt-6">
            <CardHeader><CardTitle>Send a message</CardTitle></CardHeader>
            <CardContent>
              {sent ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" aria-hidden />
                  <p className="font-medium">Thank you — your message has been sent.</p>
                  <p className="text-sm text-muted-foreground">The programme team will reach out if a response is needed.</p>
                  <Button variant="outline" className="mt-2" onClick={() => setSent(false)}>
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-4" noValidate>
                  <Field label="Your name" required error={errors.name}>
                    <Input value={form.name} onChange={set("name")} placeholder="Full name" />
                  </Field>
                  <Field label="Email address" required error={errors.email}>
                    <Input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
                  </Field>
                  <Field label="Phone number" hint="Optional">
                    <Input value={form.phone} onChange={set("phone")} placeholder="+234…" />
                  </Field>
                  <Field label="What's this about?">
                    <Select value={form.category} onChange={set("category")}>
                      {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </Select>
                  </Field>
                  <Field label="Message" required error={errors.message}>
                    <Textarea rows={5} value={form.message} onChange={set("message")} placeholder="Tell us what's going on…" />
                  </Field>

                  {errors._root && <p className="text-sm font-medium text-destructive">{errors._root}</p>}

                  <Button type="submit" className="w-full" loading={submit.isPending}>
                    <MessageCircle className="h-4 w-4" /> Send message
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
