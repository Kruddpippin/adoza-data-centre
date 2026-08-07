import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/* Throw on Supabase error so React Query surfaces it. Supabase only returns
   null data alongside a non-null error, so a thrown error leaves data non-null.
   No generated Postgrest types exist for this schema (mirrors the plain-JS web
   app, which is untyped here too), so query results are intentionally `any`. */
const run = async (promise: PromiseLike<{ data: any; error: any }>): Promise<any> => {
  const { data, error } = await promise;
  if (error) throw error;
  return data;
};

export type YouthFilters = {
  status?: string;
  lga?: string;
  beneficiary?: boolean;
  search?: string;
};

/* ============ youths ============ */
export function useYouths(filters: YouthFilters = {}) {
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

export function useYouth(id?: string) {
  return useQuery({
    queryKey: ["youth", id],
    enabled: !!id,
    queryFn: () =>
      run(
        supabase
          .from("youths")
          .select(
            "*, created_by_profile:profiles!youths_created_by_fkey(name), verified_by_profile:profiles!youths_verified_by_fkey(name), youth_skills(id, years_of_experience, proficiency, is_primary, skill:skills(id, name, category)), youth_bank_details(*), youth_delivery_preferences(*)"
          )
          .eq("id", id)
          .single()
      ),
  });
}

type SkillInput = {
  skill_id: string;
  years_of_experience?: number | null;
  proficiency?: string | null;
  is_primary?: boolean;
};

export function useSaveYouth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, skills, ...values }: { id?: string; skills?: SkillInput[]; [key: string]: any }) => {
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
    onSuccess: (youth: any) => {
      qc.invalidateQueries({ queryKey: ["youths"] });
      qc.invalidateQueries({ queryKey: ["youth", youth.id] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateYouth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...values }: { id: string; [key: string]: any }) =>
      run(supabase.from("youths").update(values).eq("id", id).select().single()),
    onSuccess: (youth: any) => {
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

/* ============ dashboard ============ */
export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [youths, equipment, funding] = await Promise.all([
        run(
          supabase
            .from("youths")
            .select(
              "id, lga, ward, gender, employment_status, verification_status, is_approved_beneficiary, eligibility_score, created_at, latitude, longitude, first_name, last_name"
            )
            .is("deleted_at", null)
        ),
        run(supabase.from("equipment").select("id, status")),
        run(supabase.from("funding").select("id, status, amount_approved")),
      ]);
      return { youths, equipment, funding };
    },
  });
}

/* ============ staff applications ============ */
// RLS scopes this to the caller's own application row — no explicit filter needed.
export function useMyStaffApplication(userId?: string) {
  return useQuery({
    queryKey: ["my-staff-application", userId],
    enabled: !!userId,
    queryFn: () => run(supabase.from("staff_applications").select("*").maybeSingle()),
  });
}

export function useSubmitStaffApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: Record<string, any>) => run(supabase.from("staff_applications").insert(values).select().single()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-staff-application"] }),
  });
}
