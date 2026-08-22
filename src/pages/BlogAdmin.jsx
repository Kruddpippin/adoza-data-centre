import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Newspaper, Plus, Pencil, Trash2, ImagePlus, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAllBlogPosts, useSaveBlogPost, useDeleteBlogPost } from "@/hooks/useBlog";
import { supabase } from "@/lib/supabase";
import {
  Button, Input, Textarea, Select, Field, Badge, ErrorState, EmptyState,
  Table, Th, Td, Modal, TableSkeleton, Spinner,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";

const STATUS_META = {
  draft: { label: "Draft", cls: "bg-muted text-muted-foreground" },
  published: { label: "Published", cls: "bg-emerald-100 text-emerald-700" },
};

const EMPTY = { title: "", slug: "", excerpt: "", content: "", cover_image_url: "", status: "draft", published_at: null };

// Lowercase, punctuation/whitespace collapsed to single hyphens, no leading/trailing
// hyphens — a plain "make it URL-safe" slugify, not a full transliteration library.
const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default function BlogAdmin() {
  const { session, user, profile, loading: authLoading } = useAuth();
  const { data: posts, isLoading, isError, refetch } = useAllBlogPosts();
  const save = useSaveBlogPost();
  const del = useDeleteBlogPost();

  const [editing, setEditing] = useState(null); // null | "new" | post id
  const [form, setForm] = useState(EMPTY);
  const [slugEdited, setSlugEdited] = useState(false);
  const [error, setError] = useState("");

  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  // Every other route in the app either guards on `session` itself (candidate pages) or
  // relies on ProtectedRoute (which already redirects here) for staff pages — this page
  // sits behind ProtectedRoute too, so this is defense-in-depth, not the only guard.
  if (authLoading) return <Spinner />;
  if (!session) return <Navigate to="/login?portal=staff" replace />;

  const openNew = () => {
    setForm(EMPTY);
    setSlugEdited(false);
    setEditing("new");
    setError("");
    setImageError("");
  };

  const openEdit = (post) => {
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content ?? "",
      cover_image_url: post.cover_image_url ?? "",
      status: post.status,
      published_at: post.published_at ?? null,
    });
    // Existing posts keep their slug fixed unless the author deliberately edits it —
    // auto-derivation from the title is only for brand-new posts, changing the slug of a
    // published post breaks anyone who already has the old /blog/:slug link.
    setSlugEdited(true);
    setEditing(post.id);
    setError("");
    setImageError("");
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setForm((f) => ({ ...f, title, slug: slugEdited ? f.slug : slugify(title) }));
  };

  const handleSlugChange = (e) => {
    setSlugEdited(true);
    setForm((f) => ({ ...f, slug: e.target.value }));
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError("");
    setImageUploading(true);
    try {
      const path = `${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage.from("blog-images").upload(path, file);
      if (uploadErr) throw uploadErr;
      const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
      setForm((f) => ({ ...f, cover_image_url: data.publicUrl }));
    } catch (err) {
      setImageError(err.message);
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required"); return; }
    if (!form.slug.trim()) { setError("Slug is required"); return; }
    setError("");
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      excerpt: form.excerpt,
      content: form.content,
      cover_image_url: form.cover_image_url || null,
      status: form.status,
      published_at: form.published_at || null,
    };
    if (editing === "new") {
      // Only stamped on create — editing an existing post (even by a different editor)
      // must never overwrite who originally authored it.
      payload.author_id = user.id;
      payload.author_name = profile?.name ?? "";
    } else {
      payload.id = editing;
    }
    try {
      await save.mutateAsync(payload);
      setEditing(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmDelete = async () => {
    setDeleteError("");
    try {
      await del.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 animate-fade-up">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight lg:text-2xl">Blog</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Write and publish posts for the candidate portal.</p>
        </div>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4" /> New post
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton columns={5} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !posts?.length ? (
        <EmptyState icon={Newspaper} title="No posts yet" message="Create your first post to get started." />
      ) : (
        <Table className="animate-fade-up">
          <thead>
            <tr>
              <Th>Title</Th>
              <Th>Status</Th>
              <Th>Published</Th>
              <Th> </Th>
              <Th> </Th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-muted/40">
                <Td className="font-medium">{p.title}</Td>
                <Td>
                  <Badge className={STATUS_META[p.status]?.cls}>{STATUS_META[p.status]?.label}</Badge>
                </Td>
                <Td className="text-xs text-muted-foreground">{p.published_at ? formatDate(p.published_at) : "—"}</Td>
                <Td>
                  <Button variant="ghost" size="icon" aria-label={`Edit ${p.title}`} onClick={() => openEdit(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Td>
                <Td>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${p.title}`}
                    onClick={() => { setDeleteError(""); setDeleteTarget(p); }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? "New post" : "Edit post"} wide>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="Title" required>
            <Input value={form.title} onChange={handleTitleChange} />
          </Field>
          <Field label="Slug" required hint="Used in the post URL — /blog/your-slug">
            <Input value={form.slug} onChange={handleSlugChange} />
          </Field>
          <Field label="Excerpt" hint="A short summary shown on the blog list page.">
            <Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          </Field>
          <Field
            label="Content"
            hint="Supports ## headings, - bullets, 1. numbered lists, fenced ``` code blocks, **bold**, and inline `code`."
          >
            <Textarea rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </Field>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Cover image</label>
            {form.cover_image_url ? (
              <div className="flex items-center gap-3">
                <img src={form.cover_image_url} alt="" className="h-16 w-24 rounded-lg object-cover" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setForm((f) => ({ ...f, cover_image_url: "" }))}
                >
                  <X className="h-4 w-4" /> Remove
                </Button>
              </div>
            ) : (
              <label className="flex h-16 w-full max-w-xs cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-input text-xs text-muted-foreground hover:bg-muted">
                <ImagePlus className="h-4 w-4" />
                {imageUploading ? "Uploading…" : "Upload image"}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} disabled={imageUploading} />
              </label>
            )}
            {imageError && <p className="mt-1 text-[11px] font-medium text-destructive">{imageError}</p>}
          </div>

          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
          </Field>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" loading={save.isPending}>Save</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete post">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Delete <span className="font-medium text-foreground">{deleteTarget?.title}</span>? This cannot be undone.
          </p>
          {deleteError && <p className="text-sm font-medium text-destructive">{deleteError}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button type="button" variant="destructive" loading={del.isPending} onClick={confirmDelete}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
