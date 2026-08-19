import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Circle, ChevronDown, Award, ClipboardList } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMyYouthRecord } from "@/hooks/useData";
import { useCourseDetail, useMyTechHubProgress, useCompleteLesson, useIssueCertificate } from "@/hooks/useTechHub";
import { CandidatePortalNav } from "@/components/CandidatePortalNav";
import { LessonContent } from "@/components/LessonContent";
import { CertificateView } from "@/components/CertificateView";
import { Card, CardContent, Badge, Spinner, ErrorState, ProgressBar, Button, Modal } from "@/components/ui";
import { COURSE_STATUS_META, cn } from "@/lib/utils";
import { techHubIcon } from "@/lib/techHubIcons";

export default function TechHubCourse() {
  const { slug } = useParams();
  const { session, user, loading: authLoading } = useAuth();
  const { data: record } = useMyYouthRecord(user?.id);
  const { data: course, isLoading, isError, refetch } = useCourseDetail(slug);
  const { data: progressData } = useMyTechHubProgress(record?.id);
  const completeLesson = useCompleteLesson();
  const issueCertificate = useIssueCertificate();

  const [openLessonId, setOpenLessonId] = useState(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certError, setCertError] = useState("");

  const lessons = useMemo(
    () => [...(course?.course_lessons ?? [])].sort((a, b) => a.order_index - b.order_index),
    [course]
  );

  const completedIds = useMemo(() => {
    if (!course) return new Set();
    return new Set(
      (progressData?.progress ?? [])
        .filter((p) => p.course_lessons?.course_id === course.id)
        .map((p) => p.lesson_id)
    );
  }, [progressData, course]);

  const certificate = useMemo(
    () => (progressData?.certificates ?? []).find((c) => c.course_id === course?.id),
    [progressData, course]
  );

  const allComplete = lessons.length > 0 && lessons.every((l) => completedIds.has(l.id));
  const doneCount = lessons.filter((l) => completedIds.has(l.id)).length;
  const percent = lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0;

  // Default to the first not-yet-completed lesson so returning candidates land where
  // they left off, instead of always back at lesson one.
  useEffect(() => {
    if (!lessons.length || openLessonId) return;
    const firstIncomplete = lessons.find((l) => !completedIds.has(l.id));
    setOpenLessonId((firstIncomplete ?? lessons[0]).id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessons.length]);

  if (authLoading) return <Spinner className="min-h-screen" />;
  if (!session) return <Navigate to="/login?portal=candidate" replace />;

  const handleMarkComplete = (lessonId) => {
    if (!record?.id) return;
    completeLesson.mutate({ youthId: record.id, lessonId });
  };

  const handleClaimCertificate = async () => {
    setCertError("");
    try {
      await issueCertificate.mutateAsync(course.id);
      setCertModalOpen(true);
    } catch (err) {
      setCertError(err.message);
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-3xl p-4 lg:p-8">
      <CandidatePortalNav youth={record} />

      <Link to="/tech-hub" className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> All courses
      </Link>

      {isLoading ? (
        <Spinner />
      ) : isError || !course ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <div className="animate-fade-up space-y-4">
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {(() => {
                  const Icon = techHubIcon(course.icon);
                  return <Icon className="h-5 w-5" aria-hidden />;
                })()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{course.category}</p>
                <h1 className="font-display text-lg font-bold tracking-tight">{course.title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{course.description}</p>
              </div>
              <Badge className={COURSE_STATUS_META[allComplete ? "completed" : percent > 0 ? "in_progress" : "not_started"].cls}>
                {COURSE_STATUS_META[allComplete ? "completed" : percent > 0 ? "in_progress" : "not_started"].label}
              </Badge>
            </div>
            <div className="mt-4 space-y-1">
              <ProgressBar value={percent} />
              <p className="text-[11px] text-muted-foreground">{doneCount}/{lessons.length} lessons complete</p>
            </div>
          </Card>

          {!record && (
            <Card>
              <CardContent className="flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ClipboardList className="h-5 w-5" aria-hidden />
                  </div>
                  <p className="text-sm text-muted-foreground">Finish your registration to save lesson progress and earn a certificate.</p>
                </div>
                <Button to="/my-registration" size="sm" className="w-full sm:w-auto">Complete registration</Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {lessons.map((lesson, i) => {
              const done = completedIds.has(lesson.id);
              const open = openLessonId === lesson.id;
              return (
                <Card key={lesson.id} className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenLessonId(open ? null : lesson.id)}
                    className="flex w-full items-center gap-3 p-4 text-left"
                    aria-expanded={open}
                  >
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-medium text-muted-foreground">Lesson {i + 1}</span>
                      <span className="block truncate text-sm font-semibold">{lesson.title}</span>
                    </span>
                    <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden />
                  </button>
                  {open && (
                    <CardContent className="animate-fade-in pt-0">
                      <div className="border-t pt-4">
                        <LessonContent text={lesson.content} />
                        <Button
                          className="mt-4"
                          size="sm"
                          variant={done ? "outline" : "default"}
                          disabled={done || !record?.id}
                          loading={completeLesson.isPending && completeLesson.variables?.lessonId === lesson.id}
                          onClick={() => handleMarkComplete(lesson.id)}
                        >
                          <CheckCircle2 className="h-4 w-4" /> {done ? "Completed" : "Mark as complete"}
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          {allComplete && (
            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15">
                    <Award className="h-5 w-5 text-accent-foreground" aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Course complete</p>
                    <p className="text-xs text-muted-foreground">
                      {certificate ? "Your certificate is ready." : "Claim your certificate from Adoza Data Centre."}
                    </p>
                    {certError && <p className="mt-1 text-xs font-medium text-destructive">{certError}</p>}
                  </div>
                </div>
                {certificate ? (
                  <Button variant="accent" size="sm" className="w-full sm:w-auto" onClick={() => setCertModalOpen(true)}>
                    <Award className="h-4 w-4" /> View certificate
                  </Button>
                ) : (
                  <Button variant="accent" size="sm" className="w-full sm:w-auto" loading={issueCertificate.isPending} onClick={handleClaimCertificate}>
                    <Award className="h-4 w-4" /> Claim certificate
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Modal open={certModalOpen} onClose={() => setCertModalOpen(false)} title="Your certificate">
        {certificate && (
          <CertificateView
            youthName={`${record?.first_name ?? ""} ${record?.last_name ?? ""}`.trim()}
            courseTitle={course?.title}
            certificateNumber={certificate.certificate_number}
            issuedAt={certificate.issued_at}
          />
        )}
      </Modal>
    </div>
  );
}
