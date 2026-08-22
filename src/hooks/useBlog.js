import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { run } from "@/hooks/useData";

/* ============ blog ============ */

// Candidate-facing feed — RLS already restricts non-editors to status='published',
// but filtering explicitly here keeps the query's intent obvious and means a
// can_manage_blog() staff member browsing this same hook still only sees live posts.
export function usePublishedBlogPosts() {
  return useQuery({
    queryKey: ["blog-posts", "published"],
    queryFn: () =>
      run(
        supabase
          .from("blog_posts")
          .select("*")
          .eq("status", "published")
          .order("published_at", { ascending: false })
      ),
  });
}

// maybeSingle (not .single()) so an unknown or unpublished slug resolves to
// `data: null` instead of throwing — the page renders that as a 404, not an error state.
export function usePublishedBlogPost(slug) {
  return useQuery({
    queryKey: ["blog-post", slug],
    enabled: !!slug,
    queryFn: () =>
      run(
        supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", slug)
          .eq("status", "published")
          .maybeSingle()
      ),
  });
}

// Staff admin list — every post regardless of status, RLS-gated to can_manage_blog() users.
export function useAllBlogPosts() {
  return useQuery({
    queryKey: ["blog-posts", "all"],
    queryFn: () => run(supabase.from("blog_posts").select("*").order("created_at", { ascending: false })),
  });
}

export function useSaveBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...values }) => {
      const payload = {
        ...values,
        // Stamp published_at the first time a post goes live; once set, later edits
        // (including further status changes) never move it, matching "first published" semantics.
        published_at:
          values.status === "published" && !values.published_at ? new Date().toISOString() : values.published_at ?? null,
        updated_at: new Date().toISOString(),
      };
      return id
        ? run(supabase.from("blog_posts").update(payload).eq("id", id).select().single())
        : run(supabase.from("blog_posts").insert(payload).select().single());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
      qc.invalidateQueries({ queryKey: ["blog-post"] });
    },
  });
}

export function useDeleteBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => run(supabase.from("blog_posts").delete().eq("id", id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog-posts"] }),
  });
}
