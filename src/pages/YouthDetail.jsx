import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Pencil, BadgeCheck, XCircle, Flag, Award, MapPin, Phone, Mail,
  GraduationCap, Briefcase, Wrench, ShieldCheck, Landmark, Truck, CalendarClock,
} from "lucide-react";
import { useYouth, useUpdateYouth } from "@/hooks/useData";
import { useAuth } from "@/context/AuthContext";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Spinner, ErrorState, Modal, Textarea, Field, Input } from "@/components/ui";
import { VERIFICATION_META, EMPLOYMENT_LABELS, DELIVERY_METHOD_LABELS, ageFrom, formatDate, formatDateTime, formatNaira, isAdminRole, cn } from "@/lib/utils";

function BankDetailsCard({ bank }) {
  return (
    <Card className="animate-fade-up">
      <CardHeader><CardTitle>Banking details</CardTitle></CardHeader>
      <CardContent>
        {bank ? (
          <div className="space-y-2 text-sm">
            <InfoRow icon={Landmark} label="Bank" value={bank.bank_name} />
            <InfoRow icon={Landmark} label="Account number" value={bank.account_number} />
            <InfoRow icon={Landmark} label="Account name" value={bank.account_name} />
            {(bank.next_of_kin_name || bank.next_of_kin_phone) && (
              <InfoRow icon={Phone} label="Next of kin" value={[bank.next_of_kin_name, bank.next_of_kin_phone].filter(Boolean).join(" — ")} />
            )}
            <p className="text-[11px] text-muted-foreground">Submitted {formatDateTime(bank.submitted_at)}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Not submitted yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

function DeliveryPreferenceCard({ preference }) {
  return (
    <Card className="animate-fade-up">
      <CardHeader><CardTitle>Delivery preference</CardTitle></CardHeader>
      <CardContent>
        {preference ? (
          <div className="space-y-2 text-sm">
            <InfoRow icon={Truck} label="Method" value={DELIVERY_METHOD_LABELS[preference.method] ?? preference.method} />
            {preference.address && <InfoRow icon={MapPin} label="Address" value={preference.address} />}
            <p className="text-[11px] text-muted-foreground">Submitted {formatDateTime(preference.submitted_at)}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Not chosen yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

function TrainingDetailsCard({ youth, canEdit }) {
  const update = useUpdateYouth();
  const [form, setForm] = useState({
    training_commencement_date: youth.training_commencement_date ?? "",
    training_venue: youth.training_venue ?? "",
    training_notes: youth.training_notes ?? "",
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = () => update.mutateAsync({ id: youth.id, ...form });

  if (!canEdit) {
    return (
      <Card className="animate-fade-up">
        <CardHeader><CardTitle>Training commencement</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <InfoRow icon={CalendarClock} label="Date" value={formatDate(youth.training_commencement_date)} />
          <InfoRow icon={MapPin} label="Venue" value={youth.training_venue} />
          {youth.training_notes && <p className="text-muted-foreground">{youth.training_notes}</p>}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-up">
      <CardHeader><CardTitle>Training commencement</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Field label="Commencement date">
          <Input type="date" value={form.training_commencement_date ?? ""} onChange={set("training_commencement_date")} />
        </Field>
        <Field label="Venue">
          <Input value={form.training_venue} onChange={set("training_venue")} placeholder="e.g. Lokoja Skills Acquisition Centre" />
        </Field>
        <Field label="Notes">
          <Textarea rows={2} value={form.training_notes} onChange={set("training_notes")} />
        </Field>
        <Button size="sm" onClick={save} loading={update.isPending}>
          <CalendarClock className="h-4 w-4" /> Save training details
        </Button>
      </CardContent>
    </Card>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function YouthDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const { data: youth, isLoading, isError, refetch } = useYouth(id);
  const update = useUpdateYouth();
  const [modal, setModal] = useState(null); // 'reject' | 'flag' | 'deny'
  const [notes, setNotes] = useState("");

  if (isLoading) return <Spinner />;
  if (isError || !youth) return <ErrorState onRetry={refetch} />;

  const canVerify = isAdminRole(role) || role === "validator";
  const canApproveBeneficiary = isAdminRole(role) || role === "committee";
  const canEdit = isAdminRole(role) || ((role === "enumerator" || role === "field_agent") && youth.created_by === user?.id && youth.verification_status === "pending");
  const meta = VERIFICATION_META[youth.verification_status];

  const setVerification = (status, extraNotes) =>
    update.mutateAsync({
      id,
      verification_status: status,
      verification_notes: extraNotes ?? null,
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    });

  const approveBeneficiary = () =>
    update.mutateAsync({ id, is_approved_beneficiary: true, beneficiary_approved_at: new Date().toISOString(), beneficiary_rejection_reason: null });

  const denyBeneficiary = (reason) =>
    update.mutateAsync({ id, is_approved_beneficiary: false, beneficiary_rejection_reason: reason });

  const submitModal = async () => {
    if (modal === "reject") await setVerification("rejected", notes);
    if (modal === "flag") await setVerification("flagged", notes);
    if (modal === "deny") await denyBeneficiary(notes);
    setModal(null);
    setNotes("");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="animate-fade-up">
        <Link to="/youths" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> All candidates
        </Link>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl font-bold tracking-tight lg:text-2xl">
              {youth.first_name} {youth.last_name}
            </h1>
            <Badge className={meta?.cls}>{meta?.label}</Badge>
            {youth.is_approved_beneficiary && <Badge className="bg-accent/15 text-accent-foreground">Beneficiary</Badge>}
          </div>
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => navigate(`/youths/${id}/edit`)}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          )}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Registered by {youth.created_by_profile?.name ?? "unknown"} on {formatDate(youth.created_at)}
        </p>
      </div>

      {/* Actions */}
      {(canVerify || canApproveBeneficiary) && (
        <Card className="animate-fade-up border-primary/20 bg-primary/[0.03] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
            <p className="mr-2 text-sm font-medium">Workflow actions:</p>
            {canVerify && youth.verification_status !== "verified" && (
              <Button size="sm" onClick={() => setVerification("verified")} loading={update.isPending}>
                <BadgeCheck className="h-4 w-4" /> Verify
              </Button>
            )}
            {canVerify && youth.verification_status !== "rejected" && (
              <Button size="sm" variant="destructive" onClick={() => setModal("reject")}>
                <XCircle className="h-4 w-4" /> Reject
              </Button>
            )}
            {canVerify && youth.verification_status !== "flagged" && (
              <Button size="sm" variant="outline" onClick={() => setModal("flag")}>
                <Flag className="h-4 w-4" /> Flag
              </Button>
            )}
            {canApproveBeneficiary && youth.verification_status === "verified" && !youth.is_approved_beneficiary && (
              <Button size="sm" variant="accent" onClick={approveBeneficiary} loading={update.isPending}>
                <Award className="h-4 w-4" /> Approve as beneficiary
              </Button>
            )}
            {canApproveBeneficiary && youth.is_approved_beneficiary && (
              <Button size="sm" variant="outline" onClick={() => setModal("deny")}>
                Revoke beneficiary
              </Button>
            )}
          </div>
          {youth.verification_notes && (
            <p className="mt-2 text-xs text-muted-foreground">
              Note: {youth.verification_notes} — {youth.verified_by_profile?.name}, {formatDateTime(youth.verified_at)}
            </p>
          )}
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left: details */}
        <div className="space-y-4 lg:col-span-2">
          <Card className="animate-fade-up">
            <CardHeader><CardTitle>Personal information</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <InfoRow icon={Phone} label="Phone" value={youth.phone} />
              <InfoRow icon={Mail} label="Email" value={youth.email} />
              <InfoRow icon={MapPin} label="Address" value={youth.address} />
              <InfoRow icon={MapPin} label="Ward / LGA" value={`${youth.ward}, ${youth.lga}`} />
              <InfoRow icon={GraduationCap} label="Education" value={youth.highest_education} />
              <InfoRow icon={Briefcase} label="Employment" value={`${EMPLOYMENT_LABELS[youth.employment_status]}${youth.occupation ? ` — ${youth.occupation}` : ""}`} />
              <InfoRow icon={Briefcase} label="Monthly income" value={formatNaira(youth.monthly_income)} />
              <InfoRow icon={Briefcase} label="Business" value={youth.business_name} />
            </CardContent>
          </Card>

          <Card className="animate-fade-up">
            <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
            <CardContent>
              {youth.youth_skills?.length ? (
                <ul className="space-y-2">
                  {youth.youth_skills.map((ys) => (
                    <li key={ys.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <Wrench className="h-4 w-4 text-primary" aria-hidden />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {ys.skill?.name}
                            {ys.is_primary && <span className="ml-2 text-[10px] font-semibold uppercase text-accent-foreground">Primary</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">{ys.skill?.category}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {ys.years_of_experience != null ? `${ys.years_of_experience} yrs` : ""}
                        {ys.proficiency ? ` · ${ys.proficiency}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No skills recorded.</p>
              )}
            </CardContent>
          </Card>

          {youth.verification_status === "verified" && canApproveBeneficiary && (
            <BankDetailsCard bank={youth.youth_bank_details} />
          )}

          {youth.is_approved_beneficiary && (youth.needs_funding || youth.needs_equipment) && (
            <DeliveryPreferenceCard preference={youth.youth_delivery_preferences} />
          )}

          {youth.is_approved_beneficiary && youth.needs_training && (
            <TrainingDetailsCard youth={youth} canEdit={canApproveBeneficiary} />
          )}
        </div>

        {/* Right: score + geo */}
        <div className="space-y-4">
          <Card className="animate-fade-up p-5 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Eligibility score</p>
            <p className={cn("stat-value mx-auto mt-3 text-5xl", (youth.eligibility_score ?? 0) >= 60 ? "text-primary" : "text-amber-600")}>
              {youth.eligibility_score ?? "—"}
            </p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Weighted across age, employment, skills, experience, needs and ward coverage.
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={youth.eligibility_score ?? 0} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${youth.eligibility_score ?? 0}%` }} />
            </div>
          </Card>

          <Card className="animate-fade-up">
            <CardHeader><CardTitle>Field capture</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow icon={MapPin} label="Coordinates"
                value={youth.latitude != null ? `${youth.latitude.toFixed?.(4) ?? youth.latitude}, ${youth.longitude?.toFixed?.(4) ?? youth.longitude}` : null} />
              {youth.latitude != null && (
                <a
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  href={`https://www.google.com/maps?q=${youth.latitude},${youth.longitude}`}
                  target="_blank" rel="noreferrer"
                >
                  Open in Google Maps
                </a>
              )}
              <InfoRow icon={ShieldCheck} label="Consent" value={youth.consent_given ? `Given ${formatDate(youth.consent_date)}` : "Not given"} />
              <InfoRow icon={BadgeCheck} label="Government ID" value={youth.government_id} />
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {[["Training", youth.needs_training], ["Equipment", youth.needs_equipment], ["Funding", youth.needs_funding]].map(([label, val]) => (
                  <span key={label} className={cn("rounded-md px-2 py-1 text-center text-[10px] font-semibold", val ? "bg-accent/15 text-accent-foreground" : "bg-muted text-muted-foreground")}>
                    {label}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === "reject" ? "Reject registration" : modal === "flag" ? "Flag for review" : "Revoke beneficiary status"}
      >
        <div className="space-y-4">
          <Field label={modal === "deny" ? "Reason" : "Notes"} required>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Explain the decision…" />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button variant={modal === "flag" ? "default" : "destructive"} onClick={submitModal} loading={update.isPending} disabled={!notes.trim()}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
