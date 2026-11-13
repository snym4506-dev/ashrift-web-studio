import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Lock } from "lucide-react";
import logo from "@/assets/yosef-radwan-logo.png";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Admin Sign In — Yosef Radwan" },
    { name: "description", content: "Administrator sign-in for Yosef Radwan's website." },
    { property: "og:title", content: "Admin Sign In — Yosef Radwan" },
    { property: "og:description", content: "Administrator sign-in for Yosef Radwan's website." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
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
          <img src={logo} alt="" className="h-7 w-7" width={28} height={28} /> <span className="font-display font-bold">Yosef Radwan</span>
        </Link>
      </div>
      <div className="w-full max-w-md rounded-3xl glass glow-border p-8">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan mb-3">
          <Lock className="h-3.5 w-3.5" /> Admin access
        </div>
        <h1 className="font-display text-3xl font-bold">
          {mode === "signin" ? "Sign in" : "Create admin"}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          {mode === "signin"
            ? "Restricted to the site owner."
            : "First account created becomes the site admin."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Email</label>
            <input
              required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl bg-card border border-border/60 px-4 py-3 outline-none focus:border-cyan"
            />
          </div>
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
            {busy ? "..." : mode === "signin" ? "Sign in" : "Create admin"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 text-sm text-muted-foreground hover:text-foreground w-full text-center"
        >
          {mode === "signin" ? "First time? Create the admin account →" : "Already have an account? Sign in →"}
        </button>
      </div>
    </div>
  );
}
