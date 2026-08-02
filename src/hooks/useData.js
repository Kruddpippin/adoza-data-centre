import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/* Throw on Supabase error so React Query surfaces it */
const run = async (promise) => {
  const { data, error } = await promise;
  if (error) throw error;
  return data;
};

/* ============ youths ============ */
export function useYouths(filters = {}) {
  return useQuery({
    queryKey: ["youths", filters],
    queryFn: () => {
      let q = supabase
        .from("youths")
        .select("*, created_by_profile:profiles!youths_created_by_fkey(name)")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (filters.status) q = q.eq("verification_status", filters.status);
      if (filters.lga) q = q.eq("lga", filters.lga);
      if (filters.beneficiary) q = q.eq("is_approved_beneficiary", true);
      if (filters.search) q = q.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      return run(q);
    },
  });
}

export function useYouth(id) {
  return useQuery({
    queryKey: ["youth", id],
    enabled: !!id,
    queryFn: () =>
      run(
        supabase
          .from("youths")
          .select(
            "*, created_by_profile:profiles!youths_created_by_fkey(name), verified_by_profile:profiles!youths_verified_by_fkey(name), youth_skills(id, years_of_experience, proficiency, is_primary, skill:skills(id, name, category))"
          )
          .eq("id", id)
          .single()
      ),
  });
}

/* Self-service: the caller's own (or claimable) youths row. RLS scopes this to either
   auth_user_id = auth.uid(), or an unlinked row whose email matches the caller's — no
   explicit filter needed here, the database enforces it. */
export function useMyYouthRecord(userId) {
  return useQuery({
    queryKey: ["my-youth-record", userId],
    enabled: !!userId,
    queryFn: () =>
      run(
        supabase
          .from("youths")
          .select("*, youth_skills(id, years_of_experience, proficiency, is_primary, skill:skills(id, name, category))")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle()
      ),
  });
}

export function useClaimYouthRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }) =>
      run(supabase.from("youths").update({ auth_user_id: userId }).eq("id", id).select().single()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-youth-record"] }),
  });
}

export function useMyFunding(youthId) {
  return useQuery({
    queryKey: ["my-funding", youthId],
    enabled: !!youthId,
    queryFn: () =>
      run(supabase.from("funding").select("*").eq("beneficiary_id", youthId).order("created_at", { ascending: false })),
  });
}

export function useSaveYouth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, skills, ...values }) => {
      let youth;
      if (id) {
        youth = await run(supabase.from("youths").update(values).eq("id", id).select().single());
      } else {
        youth = await run(supabase.from("youths").insert(values).select().single());
      }
      if (skills) {
        await run(supabase.from("youth_skills").delete().eq("youth_id", youth.id));
        if (skills.length) {
          await run(
            supabase.from("youth_skills").insert(
              skills.map((s) => ({
                youth_id: youth.id,
                skill_id: s.skill_id,
                years_of_experience: s.years_of_experience || null,
                proficiency: s.proficiency || null,
                is_primary: !!s.is_primary,
              }))
            )
          );
        }
      }
      return youth;
    },
    onSuccess: (youth) => {
      qc.invalidateQueries({ queryKey: ["youths"] });
      qc.invalidateQueries({ queryKey: ["youth", youth.id] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateYouth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...values }) => run(supabase.from("youths").update(values).eq("id", id).select().single()),
    onSuccess: (youth) => {
      qc.invalidateQueries({ queryKey: ["youths"] });
      qc.invalidateQueries({ queryKey: ["youth", youth.id] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/* ============ skills ============ */
export function useSkills() {
  return useQuery({
    queryKey: ["skills"],
    staleTime: 5 * 60 * 1000,
    queryFn: () => run(supabase.from("skills").select("*").order("name")),
  });
}

/* ============ equipment ============ */
export function useEquipment() {
  return useQuery({
    queryKey: ["equipment"],
    queryFn: () =>
      run(
        supabase
          .from("equipment")
          .select("*, assigned_youth:youths(id, first_name, last_name)")
          .order("created_at", { ascending: false })
      ),
  });
}

export function useSaveEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...values }) =>
      id
        ? run(supabase.from("equipment").update(values).eq("id", id).select().single())
        : run(supabase.from("equipment").insert(values).select().single()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["equipment"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/* ============ funding ============ */
export function useFunding() {
  return useQuery({
    queryKey: ["funding"],
    queryFn: () =>
      run(
        supabase
          .from("funding")
          .select("*, beneficiary:youths(id, first_name, last_name, lga)")
          .order("created_at", { ascending: false })
      ),
  });
}

export function useSaveFunding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...values }) =>
      id
        ? run(supabase.from("funding").update(values).eq("id", id).select().single())
        : run(supabase.from("funding").insert(values).select().single()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["funding"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/* ============ surveys ============ */
export function useSurveyTemplates() {
  return useQuery({
    queryKey: ["survey_templates"],
    queryFn: () => run(supabase.from("survey_templates").select("*").order("created_at", { ascending: false })),
  });
}

export function useSurveyResponses(templateId) {
  return useQuery({
    queryKey: ["survey_responses", templateId],
    enabled: !!templateId,
    queryFn: () =>
      run(
        supabase
          .from("survey_responses")
          .select("*, youth:youths(first_name, last_name), respondent:profiles(name)")
          .eq("template_id", templateId)
          .order("submitted_at", { ascending: false })
      ),
  });
}

export function useSubmitSurveyResponse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values) => run(supabase.from("survey_responses").insert(values).select().single()),
    onSuccess: (r) => qc.invalidateQueries({ queryKey: ["survey_responses", r.template_id] }),
  });
}

/* ============ users (admin) ============ */
export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: () => run(supabase.from("profiles").select("*").order("created_at")),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...values }) => run(supabase.from("profiles").update(values).eq("id", id).select().single()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profiles"] }),
  });
}

/* ============ notifications ============ */
export function useNotifications(userId) {
  return useQuery({
    queryKey: ["notifications", userId],
    enabled: !!userId,
    refetchInterval: 60_000,
    queryFn: () =>
      run(supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20)),
  });
}

export function useMarkNotificationsRead(userId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => run(supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false).select()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", userId] }),
  });
}

/* ============ audit ============ */
export function useAuditLog() {
  return useQuery({
    queryKey: ["audit"],
    queryFn: () =>
      run(
        supabase
          .from("audit_log")
          .select("*, actor:profiles(name)")
          .order("created_at", { ascending: false })
          .limit(200)
      ),
  });
}

/* ============ dashboard ============ */
export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [youths, equipment, funding] = await Promise.all([
        run(supabase.from("youths").select("id, lga, ward, gender, employment_status, verification_status, is_approved_beneficiary, eligibility_score, created_at, latitude, longitude, first_name, last_name").is("deleted_at", null)),
        run(supabase.from("equipment").select("id, status")),
        run(supabase.from("funding").select("id, status, amount_approved")),
      ]);
      return { youths, equipment, funding };
    },
  });
}
