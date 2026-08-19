import { useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import { GraduationCap, Handshake, ArrowRight, ClipboardList } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMyYouthRecord } from "@/hooks/useData";
import { useCourses, useMyTechHubProgress } from "@/hooks/useTechHub";
import { CandidatePortalNav } from "@/components/CandidatePortalNav";
import { Card, CardContent, Badge, Spinner, ErrorState, ProgressBar, EmptyState, Button } from "@/components/ui";
import { COURSE_STATUS_META } from "@/lib/utils";
import { techHubIcon } from "@/lib/techHubIcons";

function statusFor(percent, hasCertificate) {
  if (hasCertificate || percent >= 100) return "completed";
  if (percent > 0) return "in_progress";
  return "not_started";
}

export default function TechHub() {
  const { session, user, loading: authLoading } = useAuth();
  const { data: record, isLoading: recordLoading } = useMyYouthRecord(user?.id);
  const { data: courses, isLoading: coursesLoading, isError, refetch } = useCourses();
  const { data: progressData } = useMyTechHubProgress(record?.id);

  const rows = useMemo(() => {
    if (!courses) return [];
    const progress = progressData?.progress ?? [];
    const certificates = progressData?.certificates ?? [];
    return courses.map((c) => {
      const total = c.course_lessons?.length ?? 0;
      const done = progress.filter((p) => p.course_lessons?.course_id === c.id).length;
      const percent = total ? Math.round((done / total) * 100) : 0;
      const hasCertificate = certificates.some((cert) => cert.course_id === c.id);
      return { ...c, total, done, percent, status: statusFor(percent, hasCertificate) };
    });
  }, [courses, progressData]);

  const certifiedCount = progressData?.certificates?.length ?? 0;

  if (authLoading) return <Spinner className="min-h-screen" />;
  if (!session) return <Navigate to="/login?portal=candidate" replace />;

  return (
    <div className="mx-auto min-h-screen max-w-3xl p-4 lg:p-8">
      <CandidatePortalNav youth={record} />

      <div className="animate-fade-up mb-5">
        <h1 className="font-display text-xl font-bold tracking-tight lg:text-2xl">Tech Hub</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Free, practical digital-skills training. Complete a course to earn a certificate from Adoza Data Centre.
        </p>
      </div>

      {!recordLoading && !record && (
        <Card className="animate-fade-up mb-5">
          <CardContent className="flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ClipboardList className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-semibold">Finish your registration first</p>
                <p className="text-xs text-muted-foreground">You can browse the courses now, but you'll need a registration on file to save progress and earn certificates.</p>
              </div>
            </div>
            <Button to="/my-registration" size="sm" className="w-full sm:w-auto">Complete registration</Button>
          </CardContent>
        </Card>
      )}

      {certifiedCount > 0 && record?.is_approved_beneficiary && (
        <Card className="animate-fade-up mb-5 border-accent/30 bg-accent/5">
          <CardContent className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15">
                <Handshake className="h-5 w-5 text-accent-foreground" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-semibold">You're eligible for Outsource Staff</p>
                <p className="text-xs text-muted-foreground">
                  {certifiedCount} certificate{certifiedCount === 1 ? "" : "s"} earned — apply to a partner company.
                </p>
              </div>
            </div>
            <Link to="/outsource-staff" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline">
              View companies <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      )}

      {coursesLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="h-28 animate-pulse rounded-lg bg-muted" />
            </Card>
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !rows.length ? (
        <EmptyState icon={GraduationCap} title="No courses yet" message="Check back soon — new training is on the way." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((c, i) => {
            const Icon = techHubIcon(c.icon);
            const meta = COURSE_STATUS_META[c.status];
            return (
              <Link key={c.id} to={`/tech-hub/${c.slug}`} className="block h-full">
                <Card className={`card-lift animate-fade-up stagger-${(i % 6) + 1} h-full p-4`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <Badge className={meta.cls}>{meta.label}</Badge>
                  </div>
                  <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{c.category}</p>
                  <h3 className="font-display mt-0.5 text-sm font-bold tracking-tight">{c.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{c.description}</p>
                  <div className="mt-3 space-y-1">
                    <ProgressBar value={c.percent} />
                    <p className="text-[11px] text-muted-foreground">{c.done}/{c.total} lessons</p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
