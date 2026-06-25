import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import logo from "@/assets/ashrift-logo.png";

type Post = { id: string; slug: string; title: string; excerpt: string | null; cover_image: string | null; created_at: string };

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Journal — Ashrift" },
      { name: "description", content: "Thoughts and updates from the Ashrift studio." },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogPage,
});

function BlogPage() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  useEffect(() => {
    supabase.from("posts").select("id,slug,title,excerpt,cover_image,created_at").eq("published", true).order("created_at", { ascending: false })
      .then(({ data }) => setPosts((data ?? []) as Post[]));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-20" style={{ background: "var(--gradient-radial)" }} />
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><img src={logo} alt="" className="h-8 w-8" /><span className="font-display font-bold">Ashrift</span></Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Home</Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-20">
        <p className="font-mono text-xs uppercase tracking-widest text-cyan mb-4">// Journal</p>
        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight">
          Notes from <span className="text-gradient">the studio.</span>
        </h1>

        <div className="mt-16 space-y-6">
          {posts === null ? <div className="text-muted-foreground">Loading…</div>
            : posts.length === 0 ? <div className="rounded-2xl glass p-10 text-center text-muted-foreground">No posts published yet.</div>
            : posts.map((p) => (
              <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="block rounded-3xl glass overflow-hidden md:flex hover:-translate-y-0.5 transition">
                {p.cover_image && <img src={p.cover_image} alt="" className="md:w-64 md:h-auto aspect-[16/10] md:aspect-auto object-cover" />}
                <div className="p-7 flex-1">
                  <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                  </div>
                  <h2 className="font-display text-2xl font-bold mt-2">{p.title}</h2>
                  {p.excerpt && <p className="mt-2 text-muted-foreground line-clamp-2">{p.excerpt}</p>}
                  <div className="mt-4 inline-flex items-center gap-1 text-sm text-cyan">Read more <ArrowRight className="h-4 w-4" /></div>
                </div>
              </Link>
            ))}
        </div>
      </main>
    </div>
  );
}
