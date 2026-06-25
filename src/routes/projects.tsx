import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, ExternalLink, ArrowLeft } from "lucide-react";
import logo from "@/assets/ashrift-logo.png";

type Project = {
  id: string; slug: string; title: string; client_name: string | null;
  category: string | null; description: string; cover_image: string | null;
  gallery: string[]; live_url: string | null; tech_stack: string[]; featured: boolean;
};

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Ashrift" },
      { name: "description", content: "Selected work by Ashrift — websites and digital products built for ambitious brands." },
      { property: "og:title", content: "Projects — Ashrift" },
      { property: "og:description", content: "Selected work by Ashrift." },
    ],
    links: [{ rel: "canonical", href: "/projects" }],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const [items, setItems] = useState<Project[] | null>(null);
  useEffect(() => {
    supabase.from("projects").select("*").order("sort_order").order("created_at", { ascending: false })
      .then(({ data }) => setItems((data ?? []) as Project[]));
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

      <main className="mx-auto max-w-7xl px-6 py-20">
        <p className="font-mono text-xs uppercase tracking-widest text-cyan mb-4">// Selected work</p>
        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight">
          Projects we've <span className="text-gradient">launched.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          A growing roster of real businesses we've shipped — websites, apps and digital experiences.
        </p>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {items === null ? (
            <div className="col-span-2 text-muted-foreground">Loading…</div>
          ) : items.length === 0 ? (
            <div className="col-span-2 rounded-2xl glass p-10 text-center text-muted-foreground">
              No projects published yet. Admin can add them from <Link to="/admin" className="text-cyan underline">/admin</Link>.
            </div>
          ) : items.map((p) => (
            <article key={p.id} className="group rounded-3xl glass overflow-hidden hover:-translate-y-1 transition">
              {p.cover_image && (
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                </div>
              )}
              <div className="p-7">
                <div className="text-xs font-mono uppercase tracking-widest text-cyan">
                  {[p.client_name, p.category].filter(Boolean).join(" · ")}
                </div>
                <h2 className="font-display text-2xl font-bold mt-2">{p.title}</h2>
                <p className="mt-3 text-muted-foreground line-clamp-3">{p.description}</p>
                {p.tech_stack.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.tech_stack.map((t) => <span key={t} className="rounded-full bg-card px-3 py-1 text-xs font-mono">{t}</span>)}
                  </div>
                )}
                {p.live_url && (
                  <a href={p.live_url} target="_blank" rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-medium hover:text-cyan transition">
                    Visit live site <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                {p.gallery.length > 0 && (
                  <div className="mt-5 grid grid-cols-4 gap-2">
                    {p.gallery.slice(0, 4).map((g, i) => (
                      <img key={i} src={g} alt="" className="aspect-square rounded-lg object-cover" />
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-20 text-center">
          <Link to="/" hash="contact" className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-7 py-3.5 font-medium">
            Start your project <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
