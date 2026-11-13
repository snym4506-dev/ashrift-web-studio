import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/yosef-radwan-logo.png";

type Post = { id: string; slug: string; title: string; excerpt: string | null; content: string; cover_image: string | null; created_at: string };

export const Route = createFileRoute("/blog/$slug")({
  head: () => ({
    meta: [
      { title: "Journal Post — Yosef Radwan" },
      { name: "description", content: "A journal post by Yosef Radwan about web design, development, and digital projects." },
      { property: "og:title", content: "Journal Post — Yosef Radwan" },
      { property: "og:description", content: "A journal post by Yosef Radwan about web design, development, and digital projects." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PostPage,
});

function PostPage() {
  const { slug } = useParams({ from: "/blog/$slug" });
  const [post, setPost] = useState<Post | null | "missing">(null);

  useEffect(() => {
    supabase.from("posts").select("*").eq("slug", slug).eq("published", true).maybeSingle()
      .then(({ data }) => setPost(data ? (data as Post) : "missing"));
  }, [slug]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-20" style={{ background: "var(--gradient-radial)" }} />
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border/40">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><img src={logo} alt="" className="h-8 w-8" width={32} height={32} /><span className="font-display font-bold">Yosef Radwan</span></Link>
          <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Journal</Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-16">
        {post === null ? <div className="text-muted-foreground">Loading…</div>
          : post === "missing" ? <div className="text-center text-muted-foreground">Post not found.</div>
          : (
            <>
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mt-3">{post.title}</h1>
              {post.excerpt && <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>}
              {post.cover_image && <img src={post.cover_image} alt="" className="mt-10 rounded-2xl w-full aspect-[16/9] object-cover" />}
              <div className="mt-10 whitespace-pre-wrap leading-relaxed text-foreground/90 text-lg">
                {post.content}
              </div>
            </>
          )}
      </article>
    </div>
  );
}
