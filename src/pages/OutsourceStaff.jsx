import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Building2, Handshake, Lock, GraduationCap, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMyYouthRecord } from "@/hooks/useData";
import {
  useMyTechHubProgress, useOutsourceCompanies, useMyOutsourceApplications, useApplyToCompany, useWithdrawApplication,
} from "@/hooks/useTechHub";
import { CandidatePortalNav } from "@/components/CandidatePortalNav";
import { Card, CardContent, Badge, Spinner, ErrorState, Button, Modal, Textarea, Field, EmptyState } from "@/components/ui";
import { APPLICATION_STATUS_META } from "@/lib/utils";

function ApplyModal({ company, onClose, onApply, pending }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await onApply(message.trim());
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal open onClose={onClose} title={`Apply to ${company.name}`}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-xs text-muted-foreground">
          {company.industry} — {company.description}
        </p>
        <Field label="Why are you a good fit? (optional)">
          <Textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="A sentence or two about relevant skills or courses you've completed." />
        </Field>
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={pending}>
            <Handshake className="h-4 w-4" /> Submit application
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function OutsourceStaff() {
  const { session, user, loading: authLoading } = useAuth();
  const { data: record } = useMyYouthRecord(user?.id);
  const { data: progressData } = useMyTechHubProgress(record?.id);
  const { data: companies, isLoading: companiesLoading, isError, refetch } = useOutsourceCompanies();
  const { data: applications } = useMyOutsourceApplications(record?.id);
  const apply = useApplyToCompany();
  const withdraw = useWithdrawApplication();

  const [applyingTo, setApplyingTo] = useState(null);

  const certifiedCount = progressData?.certificates?.length ?? 0;
  const isBeneficiary = !!record?.is_approved_beneficiary;
  const eligible = isBeneficiary && certifiedCount > 0;

  const appByCompany = useMemo(() => {
    const map = new Map();
    (applications ?? []).forEach((a) => {
      if (a.status !== "withdrawn") map.set(a.company_id, a);
    });
    return map;
  }, [applications]);

  if (authLoading) return <Spinner className="min-h-screen" />;
  if (!session) return <Navigate to="/login?portal=candidate" replace />;

  return (
    <div className="mx-auto min-h-screen max-w-3xl p-4 lg:p-8">
      <CandidatePortalNav youth={record} />

      <div className="animate-fade-up mb-5">
        <h1 className="font-display text-xl font-bold tracking-tight lg:text-2xl">Outsource Staff</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Work remotely for a partner company abroad. Open to approved programme beneficiaries who've earned at least one Tech Hub certificate.
        </p>
      </div>

      {!eligible ? (
        <Card className="animate-fade-up">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
              <Lock className="h-6 w-6 text-muted-foreground" aria-hidden />
            </div>
            {!isBeneficiary ? (
              <div>
                <p className="text-sm font-semibold">Reserved for approved beneficiaries</p>
                <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
                  Outsource Staff is only open to candidates approved as programme beneficiaries. Check your registration status for updates.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold">Complete a Tech Hub course to unlock this</p>
                <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
                  Earn one certificate from any Tech Hub course and you'll be able to apply to our partner companies here.
                </p>
              </div>
            )}
            <Button to={isBeneficiary ? "/tech-hub" : "/my-registration"} size="sm">
              {isBeneficiary ? (
                <>
                  <GraduationCap className="h-4 w-4" /> Go to Tech Hub
                </>
              ) : (
                "View my registration"
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="animate-fade-up mb-5 border-accent/30 bg-accent/5">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15">
                <Handshake className="h-5 w-5 text-accent-foreground" aria-hidden />
              </div>
              <p className="text-sm">
                You're eligible with <span className="font-semibold">{certifiedCount} certificate{certifiedCount === 1 ? "" : "s"}</span>. Pick a company below to apply.
              </p>
            </CardContent>
          </Card>

          {companiesLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-4"><div className="h-24 animate-pulse rounded-lg bg-muted" /></Card>
              ))}
            </div>
          ) : isError ? (
            <ErrorState onRetry={refetch} />
          ) : !companies?.length ? (
            <EmptyState icon={Building2} title="No partner companies yet" message="Check back soon — partner companies will be announced here." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {companies.map((company, i) => {
                const application = appByCompany.get(company.id);
                return (
                  <Card key={company.id} className={`animate-fade-up stagger-${(i % 6) + 1} p-4`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Building2 className="h-5 w-5" aria-hidden />
                      </div>
                      {application && (
                        <Badge className={APPLICATION_STATUS_META[application.status].cls}>
                          {APPLICATION_STATUS_META[application.status].label}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{company.industry}</p>
                    <h3 className="font-display mt-0.5 text-sm font-bold tracking-tight">{company.name}</h3>
                    <p className="mt-1.5 text-xs text-muted-foreground">{company.description}</p>
                    <div className="mt-3">
                      {!application ? (
                        <Button size="sm" className="w-full" onClick={() => setApplyingTo(company)}>
                          <Handshake className="h-4 w-4" /> Apply
                        </Button>
                      ) : application.status === "pending" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          loading={withdraw.isPending && withdraw.variables === application.id}
                          onClick={() => withdraw.mutate(application.id)}
                        >
                          <X className="h-4 w-4" /> Withdraw application
                        </Button>
                      ) : null}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {applyingTo && (
        <ApplyModal
          company={applyingTo}
          onClose={() => setApplyingTo(null)}
          pending={apply.isPending}
          onApply={(message) => apply.mutateAsync({ youthId: record.id, companyId: applyingTo.id, message })}
        />
      )}
    </div>
  );
}
