import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMyYouthRecord } from "@/hooks/useData";
import { usePublishedBlogPost } from "@/hooks/useBlog";
import { CandidatePortalNav } from "@/components/CandidatePortalNav";
import { LessonContent } from "@/components/LessonContent";
import { Card, Spinner, ErrorState } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default function BlogPost() {
  const { slug } = useParams();
  const { session, user, loading: authLoading } = useAuth();
  const { data: record } = useMyYouthRecord(user?.id);
  const { data: post, isLoading, isError, refetch } = usePublishedBlogPost(slug);

  if (authLoading) return <Spinner className="min-h-screen" />;
  if (!session) return <Navigate to="/login?portal=candidate" replace />;

  return (
    <div className="mx-auto min-h-screen max-w-3xl p-4 lg:p-8">
      <CandidatePortalNav youth={record} />

      <Link to="/blog" className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> All posts
      </Link>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !post ? (
        <ErrorState message="This post couldn't be found — it may have been unpublished or the link is wrong." />
      ) : (
        <article className="animate-fade-up space-y-4">
          {post.cover_image_url && (
            // object-contain (not cover) so the full photo always shows — a fixed-height
            // crop was cutting off the top/bottom of images whose aspect ratio didn't
            // match the box. max-h caps only very tall images; most render at full width.
            <img
              src={post.cover_image_url}
              alt=""
              className="max-h-[28rem] w-full rounded-xl bg-muted object-contain"
            />
          )}
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight lg:text-2xl">{post.title}</h1>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {post.author_name ? `${post.author_name} · ` : ""}
              {formatDate(post.published_at)}
            </p>
          </div>
          <Card className="p-5">
            <LessonContent text={post.content} />
          </Card>
        </article>
      )}
    </div>
  );
}
