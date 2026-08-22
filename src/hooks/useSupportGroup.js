import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { run } from "@/hooks/useData";

/* ============ GYB2SYB support group applications ============ */
// RLS scopes this to the caller's own application row — no explicit filter needed.
export function useMySupportGroupApplication(userId) {
  return useQuery({
    queryKey: ["my-support-group-application", userId],
    enabled: !!userId,
    queryFn: () => run(supabase.from("support_group_applications").select("*").maybeSingle()),
  });
}

export function useSubmitSupportGroupApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values) => run(supabase.from("support_group_applications").insert(values).select().single()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-support-group-application"] }),
  });
}

export function usePendingSupportGroupApplications() {
  return useQuery({
    queryKey: ["support-group-applications", "pending"],
    queryFn: () =>
      run(
        supabase
          .from("support_group_applications")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: true })
      ),
  });
}

// SECURITY DEFINER RPC — inserts the support_group_members row and marks the
// application approved server-side; the client has no direct insert policy on
// support_group_members.
export function useApproveSupportGroupApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (applicationId) =>
      run(supabase.rpc("approve_support_group_application", { application_id: applicationId })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support-group-applications"] });
      qc.invalidateQueries({ queryKey: ["support-group-members"] });
    },
  });
}

export function useRejectSupportGroupApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (applicationId) =>
      run(
        supabase
          .from("support_group_applications")
          .update({ status: "rejected" })
          .eq("id", applicationId)
          .select()
          .single()
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["support-group-applications"] }),
  });
}

/* ============ GYB2SYB support group members ============ */
// RLS scopes this to the caller's own row (id = auth.uid()) — no explicit filter needed.
export function useMySupportGroupMembership(userId) {
  return useQuery({
    queryKey: ["my-support-group-membership", userId],
    enabled: !!userId,
    queryFn: () => run(supabase.from("support_group_members").select("*").maybeSingle()),
  });
}

export function useSupportGroupMembers() {
  return useQuery({
    queryKey: ["support-group-members"],
    queryFn: () => run(supabase.from("support_group_members").select("*").order("created_at")),
  });
}

export function useUpdateSupportGroupMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...values }) =>
      run(supabase.from("support_group_members").update(values).eq("id", id).select().single()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["support-group-members"] }),
  });
}

/* ============ GYB2SYB DOOR2DOOR executive structure ============ */
export function useExecutiveStructure() {
  return useQuery({
    queryKey: ["gyb2syb-executive-structure"],
    queryFn: () => run(supabase.from("gyb2syb_executive_structure").select("*").eq("id", 1).single()),
  });
}

export function useUpdateExecutiveStructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ content, updatedBy }) =>
      run(
        supabase
          .from("gyb2syb_executive_structure")
          .update({ content, updated_at: new Date().toISOString(), updated_by: updatedBy })
          .eq("id", 1)
          .select()
          .single()
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gyb2syb-executive-structure"] }),
  });
}
