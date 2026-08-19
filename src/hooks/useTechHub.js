import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { run } from "@/hooks/useData";

/* ============ courses ============ */
export function useCourses() {
  return useQuery({
    queryKey: ["tech-hub-courses"],
    staleTime: 5 * 60 * 1000,
    // course_lessons(id) only — enough to count total lessons for a progress bar
    // without pulling every lesson's full body text into the catalogue page.
    queryFn: () => run(supabase.from("courses").select("*, course_lessons(id)").order("order_index")),
  });
}

export function useCourseDetail(slug) {
  return useQuery({
    queryKey: ["tech-hub-course", slug],
    enabled: !!slug,
    queryFn: () =>
      run(
        supabase
          .from("courses")
          .select("*, course_lessons(*)")
          .eq("slug", slug)
          .order("order_index", { referencedTable: "course_lessons" })
          .single()
      ),
  });
}

// Every completed lesson + issued certificate for the caller's own candidate record —
// one query, used to derive per-course progress badges on the catalogue, whether a
// course is finished, and Outsource Staff eligibility (>=1 certificate).
export function useMyTechHubProgress(youthId) {
  return useQuery({
    queryKey: ["tech-hub-progress", youthId],
    enabled: !!youthId,
    queryFn: async () => {
      const [progress, certificates] = await Promise.all([
        run(
          supabase
            .from("lesson_progress")
            .select("lesson_id, completed_at, course_lessons(course_id)")
            .eq("youth_id", youthId)
        ),
        run(supabase.from("certificates").select("*").eq("youth_id", youthId)),
      ]);
      return { progress, certificates };
    },
  });
}

export function useCompleteLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ youthId, lessonId }) =>
      run(
        supabase
          .from("lesson_progress")
          .upsert({ youth_id: youthId, lesson_id: lessonId }, { onConflict: "youth_id,lesson_id", ignoreDuplicates: true })
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tech-hub-progress"] }),
  });
}

// Server-side gatekeeping (issue_certificate RPC) re-checks that every lesson in the
// course is actually complete before minting a certificate — the client can't just
// insert one directly, RLS has no client insert policy on `certificates` at all.
export function useIssueCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId) => run(supabase.rpc("issue_certificate", { p_course_id: courseId })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tech-hub-progress"] }),
  });
}

/* ============ outsource staff ============ */
export function useOutsourceCompanies() {
  return useQuery({
    queryKey: ["outsource-companies"],
    staleTime: 5 * 60 * 1000,
    queryFn: () => run(supabase.from("outsource_companies").select("*").order("order_index")),
  });
}

export function useMyOutsourceApplications(youthId) {
  return useQuery({
    queryKey: ["outsource-applications", youthId],
    enabled: !!youthId,
    queryFn: () =>
      run(
        supabase
          .from("outsource_applications")
          .select("*, company:outsource_companies(*)")
          .eq("youth_id", youthId)
          .order("created_at", { ascending: false })
      ),
  });
}

export function useApplyToCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ youthId, companyId, message }) =>
      run(
        supabase
          .from("outsource_applications")
          .insert({ youth_id: youthId, company_id: companyId, message: message || null })
          .select()
          .single()
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["outsource-applications"] }),
  });
}

export function useWithdrawApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      run(
        supabase
          .from("outsource_applications")
          .update({ status: "withdrawn", updated_at: new Date().toISOString() })
          .eq("id", id)
          .select()
          .single()
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["outsource-applications"] }),
  });
}
