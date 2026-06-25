import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { uploadMedia } from "@/lib/storage";
import { toast } from "sonner";
import logo from "@/assets/ashrift-logo.png";
import { LogOut, Plus, Trash2, Save, Image as ImageIcon, ArrowLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · Ashrift" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

type Tab = "content" | "services" | "pricing" | "posts" | "projects";

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("content");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading) return <Center><Loader2 className="h-6 w-6 animate-spin" /></Center>;
  if (!user) return null;
  if (!isAdmin) {
    return (
      <Center>
        <div className="max-w-md text-center">
          <h1 className="font-display text-3xl font-bold">Not authorized</h1>
          <p className="text-muted-foreground mt-2">This account doesn't have admin access.</p>
          <button onClick={() => supabase.auth.signOut()} className="mt-6 rounded-full glass px-5 py-2">
            Sign out
          </button>
        </div>
      </Center>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "content", label: "Hero & Contact" },
    { id: "services", label: "Services" },
    { id: "pricing", label: "Pricing" },
    { id: "projects", label: "Projects" },
    { id: "posts", label: "Posts" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40 sticky top-0 z-30 backdrop-blur-xl bg-background/70">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="h-8 w-8" />
            <div>
              <div className="font-display font-bold">Ashrift Admin</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="hidden md:inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm">
              <ArrowLeft className="h-4 w-4" /> View site
            </Link>
            <button
              onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}
              className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 pb-3 flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition ${
                tab === t.id ? "bg-foreground text-background" : "glass hover:bg-card"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {tab === "content" && <ContentEditor />}
        {tab === "services" && <ServicesEditor />}
        {tab === "pricing" && <PricingEditor />}
        {tab === "projects" && <ProjectsEditor />}
        {tab === "posts" && <PostsEditor />}
      </main>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen flex items-center justify-center p-6">{children}</div>;
}

// ---------- Content (hero + contact) ----------
type HeroContent = {
  eyebrow: string; title: string; titleAccent: string; subtitle: string;
  ctaPrimary: string; ctaSecondary: string;
  stats: { num: string; label: string }[];
};
type ContactContent = { phone: string; whatsapp: string; note: string };

function ContentEditor() {
  const [hero, setHero] = useState<HeroContent | null>(null);
  const [contact, setContact] = useState<ContactContent | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_content").select("key,value").in("key", ["hero", "contact"]);
      const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
      setHero((map.hero as HeroContent) ?? defaultHero);
      setContact((map.contact as ContactContent) ?? defaultContact);
    })();
  }, []);

  async function save() {
    setBusy(true);
    const { error } = await supabase.from("site_content").upsert([
      { key: "hero", value: hero },
      { key: "contact", value: contact },
    ]);
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("Saved");
  }

  if (!hero || !contact) return <Loader2 className="h-5 w-5 animate-spin" />;

  return (
    <div className="space-y-8">
      <Card title="Hero section">
        <Field label="Eyebrow tag" value={hero.eyebrow} onChange={(v) => setHero({ ...hero, eyebrow: v })} />
        <Field label="Headline (line 1)" value={hero.title} onChange={(v) => setHero({ ...hero, title: v })} />
        <Field label="Headline accent (line 2, gradient)" value={hero.titleAccent} onChange={(v) => setHero({ ...hero, titleAccent: v })} />
        <Field label="Subtitle" value={hero.subtitle} onChange={(v) => setHero({ ...hero, subtitle: v })} textarea />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Primary CTA label" value={hero.ctaPrimary} onChange={(v) => setHero({ ...hero, ctaPrimary: v })} />
          <Field label="Secondary CTA label" value={hero.ctaSecondary} onChange={(v) => setHero({ ...hero, ctaSecondary: v })} />
        </div>
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">Stats</div>
          {hero.stats.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 mb-2">
              <input className="rounded-lg bg-card border border-border/60 px-3 py-2" value={s.num}
                onChange={(e) => { const c = [...hero.stats]; c[i] = { ...c[i], num: e.target.value }; setHero({ ...hero, stats: c }); }} />
              <input className="rounded-lg bg-card border border-border/60 px-3 py-2" value={s.label}
                onChange={(e) => { const c = [...hero.stats]; c[i] = { ...c[i], label: e.target.value }; setHero({ ...hero, stats: c }); }} />
              <button onClick={() => setHero({ ...hero, stats: hero.stats.filter((_, x) => x !== i) })} className="p-2 text-muted-foreground hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button onClick={() => setHero({ ...hero, stats: [...hero.stats, { num: "", label: "" }] })} className="text-sm text-cyan hover:underline inline-flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add stat
          </button>
        </div>
      </Card>

      <Card title="Contact">
        <Field label="Phone" value={contact.phone} onChange={(v) => setContact({ ...contact, phone: v })} />
        <Field label="WhatsApp (with country code)" value={contact.whatsapp} onChange={(v) => setContact({ ...contact, whatsapp: v })} />
        <Field label="Note" value={contact.note} onChange={(v) => setContact({ ...contact, note: v })} />
      </Card>

      <SaveBar busy={busy} onSave={save} />
    </div>
  );
}

// ---------- Services ----------
type Service = { title: string; desc: string };
function ServicesEditor() {
  const [items, setItems] = useState<Service[] | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_content").select("value").eq("key", "services").maybeSingle();
      setItems((data?.value as Service[] | undefined) ?? defaultServices);
    })();
  }, []);

  async function save() {
    setBusy(true);
    const { error } = await supabase.from("site_content").upsert({ key: "services", value: items });
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("Saved");
  }

  if (!items) return <Loader2 className="h-5 w-5 animate-spin" />;

  return (
    <div className="space-y-4">
      {items.map((it, i) => (
        <Card key={i} title={`Service #${i + 1}`} action={
          <button onClick={() => setItems(items.filter((_, x) => x !== i))} className="text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
        }>
          <Field label="Title" value={it.title} onChange={(v) => { const c = [...items]; c[i] = { ...c[i], title: v }; setItems(c); }} />
          <Field label="Description" value={it.desc} onChange={(v) => { const c = [...items]; c[i] = { ...c[i], desc: v }; setItems(c); }} textarea />
        </Card>
      ))}
      <button onClick={() => setItems([...items, { title: "", desc: "" }])} className="rounded-full glass px-5 py-2.5 inline-flex items-center gap-2">
        <Plus className="h-4 w-4" /> Add service
      </button>
      <SaveBar busy={busy} onSave={save} />
    </div>
  );
}

// ---------- Pricing ----------
type Plan = { name: string; price: string; tag: string; featured?: boolean; features: string[] };
function PricingEditor() {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_content").select("value").eq("key", "pricing").maybeSingle();
      setPlans((data?.value as Plan[] | undefined) ?? defaultPlans);
    })();
  }, []);

  async function save() {
    setBusy(true);
    const { error } = await supabase.from("site_content").upsert({ key: "pricing", value: plans });
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("Saved");
  }

  if (!plans) return <Loader2 className="h-5 w-5 animate-spin" />;

  return (
    <div className="space-y-4">
      {plans.map((p, i) => (
        <Card key={i} title={`Tier #${i + 1}`} action={
          <button onClick={() => setPlans(plans.filter((_, x) => x !== i))} className="text-red-400"><Trash2 className="h-4 w-4" /></button>
        }>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name" value={p.name} onChange={(v) => { const c = [...plans]; c[i] = { ...c[i], name: v }; setPlans(c); }} />
            <Field label="Price label" value={p.price} onChange={(v) => { const c = [...plans]; c[i] = { ...c[i], price: v }; setPlans(c); }} />
            <Field label="Tag" value={p.tag} onChange={(v) => { const c = [...plans]; c[i] = { ...c[i], tag: v }; setPlans(c); }} />
            <label className="flex items-center gap-2 text-sm self-end">
              <input type="checkbox" checked={!!p.featured} onChange={(e) => { const c = [...plans]; c[i] = { ...c[i], featured: e.target.checked }; setPlans(c); }} />
              Featured (recommended)
            </label>
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">Features</div>
            {p.features.map((f, fi) => (
              <div key={fi} className="flex gap-2 mb-2">
                <input className="flex-1 rounded-lg bg-card border border-border/60 px-3 py-2" value={f}
                  onChange={(e) => { const c = [...plans]; const fs = [...c[i].features]; fs[fi] = e.target.value; c[i] = { ...c[i], features: fs }; setPlans(c); }} />
                <button onClick={() => { const c = [...plans]; c[i] = { ...c[i], features: c[i].features.filter((_, x) => x !== fi) }; setPlans(c); }} className="p-2 text-muted-foreground hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button onClick={() => { const c = [...plans]; c[i] = { ...c[i], features: [...c[i].features, ""] }; setPlans(c); }} className="text-sm text-cyan inline-flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add feature
            </button>
          </div>
        </Card>
      ))}
      <button onClick={() => setPlans([...plans, { name: "New tier", price: "", tag: "", features: [] }])} className="rounded-full glass px-5 py-2.5 inline-flex items-center gap-2">
        <Plus className="h-4 w-4" /> Add tier
      </button>
      <SaveBar busy={busy} onSave={save} />
    </div>
  );
}

// ---------- Projects ----------
type ProjectRow = {
  id?: string; slug: string; title: string; client_name: string; category: string;
  description: string; cover_image: string; gallery: string[]; live_url: string;
  tech_stack: string[]; featured: boolean; sort_order: number;
};

function ProjectsEditor() {
  const [items, setItems] = useState<ProjectRow[]>([]);
  const [editing, setEditing] = useState<ProjectRow | null>(null);
  const [loading, setLoading] = useState(true);

  async function reload() {
    setLoading(true);
    const { data } = await supabase.from("projects").select("*").order("sort_order").order("created_at", { ascending: false });
    setItems((data ?? []) as ProjectRow[]);
    setLoading(false);
  }
  useEffect(() => { reload(); }, []);

  if (editing) return <ProjectForm initial={editing} onCancel={() => setEditing(null)} onSaved={async () => { setEditing(null); await reload(); }} />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl font-bold">Projects ({items.length})</h2>
        <button onClick={() => setEditing(emptyProject())} className="rounded-full bg-foreground text-background px-5 py-2.5 inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> New project
        </button>
      </div>
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : items.length === 0 ? (
        <Card title="No projects yet"><p className="text-muted-foreground">Add your first successful project.</p></Card>
      ) : items.map((p) => (
        <div key={p.id} className="rounded-2xl glass p-4 flex items-center gap-4">
          {p.cover_image ? (
            <img src={p.cover_image} alt="" className="h-16 w-16 rounded-lg object-cover" />
          ) : <div className="h-16 w-16 rounded-lg bg-card flex items-center justify-center"><ImageIcon className="h-5 w-5 text-muted-foreground" /></div>}
          <div className="flex-1 min-w-0">
            <div className="font-display font-semibold truncate">{p.title}</div>
            <div className="text-xs text-muted-foreground truncate">{p.client_name} · {p.category}</div>
          </div>
          <button onClick={() => setEditing(p)} className="rounded-full glass px-4 py-1.5 text-sm">Edit</button>
          <button onClick={async () => {
            if (!confirm("Delete project?")) return;
            await supabase.from("projects").delete().eq("id", p.id!);
            reload();
          }} className="p-2 text-red-400"><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
    </div>
  );
}

function emptyProject(): ProjectRow {
  return { slug: "", title: "", client_name: "", category: "", description: "", cover_image: "", gallery: [], live_url: "", tech_stack: [], featured: false, sort_order: 0 };
}

function ProjectForm({ initial, onCancel, onSaved }: { initial: ProjectRow; onCancel: () => void; onSaved: () => void }) {
  const [p, setP] = useState<ProjectRow>(initial);
  const [busy, setBusy] = useState(false);
  const [techInput, setTechInput] = useState("");

  async function save() {
    setBusy(true);
    const slug = p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const payload = { ...p, slug };
    const { error } = p.id
      ? await supabase.from("projects").update(payload).eq("id", p.id)
      : await supabase.from("projects").insert(payload);
    setBusy(false);
    if (error) toast.error(error.message); else { toast.success("Saved"); onSaved(); }
  }

  return (
    <div className="space-y-4">
      <button onClick={onCancel} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <Card title={p.id ? "Edit project" : "New project"}>
        <Field label="Title" value={p.title} onChange={(v) => setP({ ...p, title: v })} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Slug (URL)" value={p.slug} onChange={(v) => setP({ ...p, slug: v })} placeholder="auto from title" />
          <Field label="Client name" value={p.client_name} onChange={(v) => setP({ ...p, client_name: v })} />
          <Field label="Category" value={p.category} onChange={(v) => setP({ ...p, category: v })} placeholder="Restaurant, Café…" />
          <Field label="Live URL" value={p.live_url} onChange={(v) => setP({ ...p, live_url: v })} placeholder="https://" />
        </div>
        <Field label="Description" value={p.description} onChange={(v) => setP({ ...p, description: v })} textarea />

        <ImageUploadField label="Cover image" value={p.cover_image} onChange={(v) => setP({ ...p, cover_image: v })} />

        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">Gallery</div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-2">
            {p.gallery.map((g, i) => (
              <div key={i} className="relative group">
                <img src={g} alt="" className="aspect-square w-full rounded-lg object-cover" />
                <button onClick={() => setP({ ...p, gallery: p.gallery.filter((_, x) => x !== i) })} className="absolute top-1 right-1 p-1 rounded bg-black/70 text-white opacity-0 group-hover:opacity-100">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <ImageUploader onUploaded={(url) => setP({ ...p, gallery: [...p.gallery, url] })} label="+ Add gallery image" />
        </div>

        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">Tech stack</div>
          <div className="flex flex-wrap gap-2 mb-2">
            {p.tech_stack.map((t, i) => (
              <span key={i} className="rounded-full glass px-3 py-1 text-sm inline-flex items-center gap-2">
                {t}
                <button onClick={() => setP({ ...p, tech_stack: p.tech_stack.filter((_, x) => x !== i) })}>×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="flex-1 rounded-lg bg-card border border-border/60 px-3 py-2"
              value={techInput} onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (techInput.trim()) { setP({ ...p, tech_stack: [...p.tech_stack, techInput.trim()] }); setTechInput(""); } } }}
              placeholder="React, Next.js… (Enter)" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={p.featured} onChange={(e) => setP({ ...p, featured: e.target.checked })} />
            Featured on homepage
          </label>
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Sort order</label>
            <input type="number" className="mt-1 w-full rounded-lg bg-card border border-border/60 px-3 py-2"
              value={p.sort_order} onChange={(e) => setP({ ...p, sort_order: Number(e.target.value) })} />
          </div>
        </div>
      </Card>
      <SaveBar busy={busy} onSave={save} />
    </div>
  );
}

// ---------- Posts ----------
type PostRow = { id?: string; slug: string; title: string; excerpt: string; content: string; cover_image: string; published: boolean };

function PostsEditor() {
  const [items, setItems] = useState<PostRow[]>([]);
  const [editing, setEditing] = useState<PostRow | null>(null);
  const [loading, setLoading] = useState(true);

  async function reload() {
    setLoading(true);
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    setItems((data ?? []) as PostRow[]);
    setLoading(false);
  }
  useEffect(() => { reload(); }, []);

  if (editing) return <PostForm initial={editing} onCancel={() => setEditing(null)} onSaved={async () => { setEditing(null); await reload(); }} />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl font-bold">Posts ({items.length})</h2>
        <button onClick={() => setEditing({ slug: "", title: "", excerpt: "", content: "", cover_image: "", published: true })} className="rounded-full bg-foreground text-background px-5 py-2.5 inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> New post
        </button>
      </div>
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : items.length === 0 ? (
        <Card title="No posts yet"><p className="text-muted-foreground">Write your first post.</p></Card>
      ) : items.map((p) => (
        <div key={p.id} className="rounded-2xl glass p-4 flex items-center gap-4">
          {p.cover_image ? <img src={p.cover_image} alt="" className="h-16 w-16 rounded-lg object-cover" /> : <div className="h-16 w-16 rounded-lg bg-card" />}
          <div className="flex-1 min-w-0">
            <div className="font-display font-semibold truncate">{p.title}</div>
            <div className="text-xs text-muted-foreground truncate">/{p.slug} · {p.published ? "Published" : "Draft"}</div>
          </div>
          <button onClick={() => setEditing(p)} className="rounded-full glass px-4 py-1.5 text-sm">Edit</button>
          <button onClick={async () => {
            if (!confirm("Delete post?")) return;
            await supabase.from("posts").delete().eq("id", p.id!);
            reload();
          }} className="p-2 text-red-400"><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
    </div>
  );
}

function PostForm({ initial, onCancel, onSaved }: { initial: PostRow; onCancel: () => void; onSaved: () => void }) {
  const [p, setP] = useState<PostRow>(initial);
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    const slug = p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const payload = { ...p, slug };
    const { error } = p.id
      ? await supabase.from("posts").update(payload).eq("id", p.id)
      : await supabase.from("posts").insert(payload);
    setBusy(false);
    if (error) toast.error(error.message); else { toast.success("Saved"); onSaved(); }
  }
  return (
    <div className="space-y-4">
      <button onClick={onCancel} className="text-sm text-muted-foreground inline-flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Back</button>
      <Card title={p.id ? "Edit post" : "New post"}>
        <Field label="Title" value={p.title} onChange={(v) => setP({ ...p, title: v })} />
        <Field label="Slug" value={p.slug} onChange={(v) => setP({ ...p, slug: v })} placeholder="auto from title" />
        <Field label="Excerpt" value={p.excerpt} onChange={(v) => setP({ ...p, excerpt: v })} textarea />
        <ImageUploadField label="Cover image" value={p.cover_image} onChange={(v) => setP({ ...p, cover_image: v })} />
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Content (markdown / plain)</label>
          <textarea className="mt-1 w-full min-h-[300px] rounded-xl bg-card border border-border/60 px-4 py-3 outline-none focus:border-cyan font-mono text-sm"
            value={p.content} onChange={(e) => setP({ ...p, content: e.target.value })} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={p.published} onChange={(e) => setP({ ...p, published: e.target.checked })} />
          Published
        </label>
      </Card>
      <SaveBar busy={busy} onSave={save} />
    </div>
  );
}

// ---------- Shared UI ----------
function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl glass p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}
function Field({ label, value, onChange, textarea, placeholder }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</label>
      {textarea ? (
        <textarea className="mt-1 w-full rounded-xl bg-card border border-border/60 px-4 py-3 outline-none focus:border-cyan min-h-[100px]"
          value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="mt-1 w-full rounded-xl bg-card border border-border/60 px-4 py-3 outline-none focus:border-cyan"
          value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}
function SaveBar({ busy, onSave }: { busy: boolean; onSave: () => void }) {
  return (
    <div className="sticky bottom-4 flex justify-end">
      <button onClick={onSave} disabled={busy}
        className="rounded-full bg-foreground text-background px-7 py-3 font-medium inline-flex items-center gap-2 shadow-lg disabled:opacity-50">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
      </button>
    </div>
  );
}

function ImageUploader({ onUploaded, label }: { onUploaded: (url: string) => void; label: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <label className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 cursor-pointer text-sm">
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
      <span>{label}</span>
      <input type="file" accept="image/*" hidden disabled={busy} onChange={async (e) => {
        const file = e.target.files?.[0]; if (!file) return;
        setBusy(true);
        try { const url = await uploadMedia(file); onUploaded(url); toast.success("Uploaded"); }
        catch (err) { toast.error(err instanceof Error ? err.message : "Upload failed"); }
        finally { setBusy(false); e.target.value = ""; }
      }} />
    </label>
  );
}
function ImageUploadField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-1 flex items-center gap-3">
        {value ? <img src={value} alt="" className="h-20 w-20 rounded-lg object-cover" /> : <div className="h-20 w-20 rounded-lg bg-card flex items-center justify-center"><ImageIcon className="h-5 w-5 text-muted-foreground" /></div>}
        <div className="flex flex-col gap-2">
          <ImageUploader label={value ? "Replace image" : "Upload image"} onUploaded={onChange} />
          {value && <button onClick={() => onChange("")} className="text-xs text-red-400 text-left">Remove</button>}
        </div>
      </div>
    </div>
  );
}

// Defaults
const defaultHero: HeroContent = {
  eyebrow: "Web studio · Est. by Youssef Radwan",
  title: "Websites that",
  titleAccent: "feel like cinema.",
  subtitle: "Ashrift designs and builds bespoke websites for cafés, restaurants, companies and brands that refuse to look like everyone else.",
  ctaPrimary: "Start your project",
  ctaSecondary: "Explore services",
  stats: [
    { num: "120+", label: "Projects shipped" },
    { num: "98", label: "PageSpeed score" },
    { num: "24/7", label: "Support available" },
    { num: "100%", label: "Custom designs" },
  ],
};
const defaultContact: ContactContent = { phone: "01284164897", whatsapp: "201284164897", note: "Typical first response in under 4 hours." };
const defaultServices: Service[] = [
  { title: "Business Websites", desc: "Conversion-focused sites for companies, agencies and professional services." },
  { title: "E-Commerce", desc: "Full online stores with cart, checkout, payments and inventory management." },
  { title: "Custom Web Apps", desc: "Dashboards, booking systems, portals and bespoke tooling built to scale." },
  { title: "Brand & UI Design", desc: "Identity systems, logos and interface design that look unmistakable." },
];
const defaultPlans: Plan[] = [
  { name: "Starter", price: "Essential", tag: "Small business", features: ["Up to 5 custom pages", "Mobile-first responsive", "Contact form & WhatsApp", "Basic SEO setup", "1 month support"] },
  { name: "Studio", price: "Most Popular", tag: "Growing brands", featured: true, features: ["Up to 12 custom pages", "Cinematic animations", "CMS / Admin panel", "Advanced SEO & analytics", "3 months support"] },
  { name: "Bespoke", price: "Tailored", tag: "Enterprise & e-commerce", features: ["Unlimited pages & flows", "E-commerce / Web app", "Custom integrations", "Dedicated project lead", "12 months support"] },
];
