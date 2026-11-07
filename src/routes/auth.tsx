import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Lock } from "lucide-react";
import logo from "@/assets/yosef-radwan-mark.png";

const ADMIN_EMAIL = "snym4506@gmail.com";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Admin Sign In · Yosef Radwan" }, { name: "robots", content: "noindex" }, { name: "description", content: "Private portfolio administration." }, { property: "og:title", content: "Admin Sign In · Yosef Radwan" }, { property: "og:description", content: "Private portfolio administration." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password });
      if (error) throw error;
      navigate({ to: "/admin" });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--gradient-radial)" }}>
      <div className="absolute top-6 left-6">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <img src={logo} alt="" className="h-7 w-7" width={1024} height={1024} /> <span className="font-display font-bold">Yosef Radwan</span>
        </Link>
      </div>
      <div className="w-full max-w-md rounded-3xl glass glow-border p-8">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan mb-3">
          <Lock className="h-3.5 w-3.5" /> Admin access
        </div>
        <h1 className="font-display text-3xl font-bold">
          Sign in
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          "Private access for Yosef Radwan."
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Password</label>
            <input
              required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl bg-card border border-border/60 px-4 py-3 outline-none focus:border-cyan"
            />
          </div>
          {err && <div className="text-sm text-red-400">{err}</div>}
          <button
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-6 py-3 font-medium transition hover:scale-[1.02] disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
