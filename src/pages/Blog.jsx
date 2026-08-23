import { Link, Navigate } from "react-router-dom";
import { Newspaper } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMyYouthRecord } from "@/hooks/useData";
import { useMySupportGroupMembership } from "@/hooks/useSupportGroup";
import { usePublishedBlogPosts } from "@/hooks/useBlog";
import { CandidatePortalNav } from "@/components/CandidatePortalNav";
import { SupportGroupNav } from "@/components/SupportGroupNav";
import { Card, Spinner, ErrorState, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default function Blog() {
  const { session, user, loading: authLoading } = useAuth();
  const { data: record } = useMyYouthRecord(user?.id);
  const { data: member } = useMySupportGroupMembership(user?.id);
  const { data: posts, isLoading, isError, refetch } = usePublishedBlogPosts();

  if (authLoading) return <Spinner className="min-h-screen" />;
  if (!session) return <Navigate to="/login?portal=candidate" replace />;

  return (
    <div className="mx-auto min-h-screen max-w-3xl p-4 lg:p-8">
      {/* The blog is shared across both member portals — show whichever nav actually
          belongs to this viewer instead of always assuming they're a candidate. */}
      {member ? <SupportGroupNav member={member} /> : <CandidatePortalNav youth={record} />}

      <div className="animate-fade-up mb-5">
        <h1 className="font-display text-xl font-bold tracking-tight lg:text-2xl">Blog</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          News, stories and updates from Adoza Data Centre.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="h-40 animate-pulse rounded-lg bg-muted" />
            </Card>
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !posts?.length ? (
        <EmptyState icon={Newspaper} title="No posts yet" message="Check back soon — news and updates will show up here." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {posts.map((p, i) => (
            <Link key={p.id} to={`/blog/${p.slug}`} className="block h-full">
              <Card className={`card-lift animate-fade-up stagger-${(i % 6) + 1} h-full overflow-hidden`}>
                {p.cover_image_url ? (
                  <img src={p.cover_image_url} alt="" className="h-36 w-full object-cover" />
                ) : (
                  <div className="flex h-36 w-full items-center justify-center bg-muted">
                    <Newspaper className="h-8 w-8 text-muted-foreground" aria-hidden />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-display text-sm font-bold tracking-tight">{p.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{p.excerpt}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">{formatDate(p.published_at)}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
