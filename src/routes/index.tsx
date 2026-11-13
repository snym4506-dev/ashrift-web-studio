import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Code2, Palette, Zap, Globe, ShoppingBag, Search,
  Smartphone, Shield, Rocket, Phone, Mail, ArrowRight,
  Check, Sparkles, Menu, X, ExternalLink,
} from "lucide-react";
import { HeroScene } from "@/components/HeroScene";
import { IntroTunnel } from "@/components/IntroTunnel";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/yosef-radwan-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Yosef Radwan — Web Designer & Developer" },
      { name: "description", content: "Yosef Radwan designs and builds distinctive websites for businesses, cafés, restaurants, and ambitious brands." },
      { property: "og:title", content: "Yosef Radwan — Web Designer & Developer" },
      { property: "og:description", content: "Distinctive websites designed and built by Yosef Radwan for businesses and ambitious brands." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const serviceIcons = [Globe, ShoppingBag, Code2, Palette, Smartphone, Search, Shield, Zap];

const defaultHero = {
  eyebrow: "Independent web designer · Yosef Radwan",
  title: "Websites that",
  titleAccent: "feel like cinema.",
  subtitle: "Yosef Radwan designs and builds bespoke websites for cafés, restaurants, companies and brands that refuse to look like everyone else.",
  ctaPrimary: "Start your project",
  ctaSecondary: "Explore services",
  stats: [
    { num: "120+", label: "Projects shipped" },
    { num: "98", label: "PageSpeed score" },
    { num: "24/7", label: "Support available" },
    { num: "100%", label: "Custom designs" },
  ],
};
const defaultContact = { phone: "01284164897", whatsapp: "201284164897", note: "Typical first response in under 4 hours." };
const defaultServices = [
  { title: "Business Websites", desc: "Conversion-focused sites for companies, agencies and professional services." },
  { title: "E-Commerce", desc: "Full online stores with cart, checkout, payments and inventory management." },
  { title: "Custom Web Apps", desc: "Dashboards, booking systems, portals and bespoke tooling built to scale." },
  { title: "Brand & UI Design", desc: "Identity systems, logos and interface design that look unmistakable." },
  { title: "Mobile-First", desc: "Pixel-perfect responsive experiences across every device and screen size." },
  { title: "SEO & Performance", desc: "Lightning-fast Core Web Vitals, structured data and search optimization." },
  { title: "Hosting & Security", desc: "Managed deployment, SSL, backups and continuous monitoring included." },
  { title: "Ongoing Support", desc: "Updates, new features and priority response from a team that knows your build." },
];
const industries = ["Cafés", "Restaurants", "Startups", "Real Estate", "Clinics", "Gyms", "Boutiques", "Agencies", "Hotels", "Studios"];
const processSteps = [
  { step: "01", title: "Discovery", desc: "We map your goals, audience and competitors into a clear creative brief." },
  { step: "02", title: "Design", desc: "Custom visual direction and interactive prototypes — no templates, ever." },
  { step: "03", title: "Build", desc: "Hand-crafted code, animation and integrations engineered for performance." },
  { step: "04", title: "Launch & Grow", desc: "Deploy, measure, iterate. We keep your site sharp long after go-live." },
];
const defaultPlans = [
  { name: "Starter", price: "Essential", tag: "Small business", features: ["Up to 5 custom pages", "Mobile-first responsive", "Contact form & WhatsApp", "Basic SEO setup", "1 month support"] },
  { name: "Studio", price: "Most Popular", tag: "Growing brands", featured: true, features: ["Up to 12 custom pages", "Cinematic animations", "CMS / Admin panel", "Advanced SEO & analytics", "3 months support", "Performance tuning"] },
  { name: "Bespoke", price: "Tailored", tag: "Enterprise & e-commerce", features: ["Unlimited pages & flows", "E-commerce / Web app", "Custom integrations", "Dedicated project lead", "12 months support", "SLA & monitoring"] },
];

type FeaturedProject = { id: string; slug: string; title: string; client_name: string | null; category: string | null; description: string; cover_image: string | null };

function Index() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  const [hero, setHero] = useState(defaultHero);
  const [contact, setContact] = useState(defaultContact);
  const [services, setServices] = useState(defaultServices);
  const [plans, setPlans] = useState(defaultPlans);
  const [featured, setFeatured] = useState<FeaturedProject[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem("ashrift-intro-seen");
    if (!seen) setShowIntro(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_content").select("key,value").in("key", ["hero", "contact", "services", "pricing"]);
      const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
      if (map.hero) setHero(map.hero as typeof defaultHero);
      if (map.contact) setContact(map.contact as typeof defaultContact);
      if (map.services) setServices(map.services as typeof defaultServices);
      if (map.pricing) setPlans(map.pricing as typeof defaultPlans);

      const { data: proj } = await supabase.from("projects").select("id,slug,title,client_name,category,description,cover_image")
        .eq("featured", true).order("sort_order").limit(3);
      setFeatured((proj ?? []) as FeaturedProject[]);
    })();
  }, []);

  return (
    <>
      {showIntro && (
        <IntroTunnel onDone={() => {
          sessionStorage.setItem("ashrift-intro-seen", "1");
          setShowIntro(false);
        }} />
      )}

      <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
        <div className="pointer-events-none fixed inset-0 -z-20" style={{ background: "var(--gradient-radial)" }} />
        <div className="pointer-events-none fixed inset-0 -z-20 opacity-40"
          style={{ backgroundImage: "radial-gradient(circle at 20% 10%, oklch(0.62 0.26 305 / 0.25), transparent 40%), radial-gradient(circle at 80% 60%, oklch(0.78 0.16 210 / 0.2), transparent 45%)" }} />

        {/* NAV */}
        <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}>
          <div className={`mx-auto max-w-7xl px-6 transition-all duration-500 ${scrolled ? "glass rounded-2xl" : ""}`}>
            <nav className="flex items-center justify-between">
              <a href="#top" className="flex items-center gap-2.5">
                <img src={logo} alt="Yosef Radwan" className="h-9 w-9" width={36} height={36} />
                <span className="font-display text-xl font-bold tracking-tight">Yosef Radwan</span>
              </a>
              <ul className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
                <li><a href="#services" className="hover:text-foreground transition">Services</a></li>
                <li><Link to="/projects" className="hover:text-foreground transition">Projects</Link></li>
                <li><a href="#process" className="hover:text-foreground transition">Process</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition">Pricing</a></li>
                <li><Link to="/blog" className="hover:text-foreground transition">Journal</Link></li>
                <li><a href="#contact" className="hover:text-foreground transition">Contact</a></li>
              </ul>
              <a href="#contact" className="hidden md:inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium glow-border bg-card/40 hover:bg-card transition">
                Start a project <ArrowRight className="h-4 w-4" />
              </a>
              <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </nav>
            {menuOpen && (
              <ul className="md:hidden mt-4 flex flex-col gap-3 pb-4 text-sm">
                <li><a href="#services" onClick={() => setMenuOpen(false)}>Services</a></li>
                <li><Link to="/projects" onClick={() => setMenuOpen(false)}>Projects</Link></li>
                <li><a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a></li>
                <li><Link to="/blog" onClick={() => setMenuOpen(false)}>Journal</Link></li>
                <li><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a></li>
              </ul>
            )}
          </div>
        </header>

        {/* HERO */}
        <section id="top" className="relative min-h-screen flex items-center pt-24 pb-12">
          <HeroScene />
          <div className="relative mx-auto max-w-7xl px-6 w-full">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground mb-8 animate-float-up">
                <Sparkles className="h-3.5 w-3.5 text-cyan" />
                {hero.eyebrow}
              </div>
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight animate-float-up" style={{ animationDelay: "0.1s" }}>
                {hero.title} <br />
                <span className="text-gradient">{hero.titleAccent}</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg md:text-xl text-muted-foreground leading-relaxed animate-float-up" style={{ animationDelay: "0.25s" }}>
                {hero.subtitle}
              </p>
              <div className="mt-10 flex flex-wrap gap-4 animate-float-up" style={{ animationDelay: "0.4s" }}>
                <a href="#contact" className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-7 py-3.5 font-medium transition hover:scale-[1.02]" style={{ boxShadow: "var(--shadow-glow)" }}>
                  {hero.ctaPrimary}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
                <a href="#services" className="inline-flex items-center gap-2 rounded-full glass px-7 py-3.5 font-medium hover:bg-card transition">
                  {hero.ctaSecondary}
                </a>
              </div>

              <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 animate-float-up" style={{ animationDelay: "0.55s" }}>
                {hero.stats.map((s, i) => (
                  <div key={i}>
                    <div className="font-display text-3xl md:text-4xl font-bold text-gradient">{s.num}</div>
                    <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs font-mono uppercase tracking-widest text-muted-foreground animate-pulse-glow">
            Scroll to explore
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="relative py-32 px-6">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl mb-16">
              <p className="font-mono text-xs uppercase tracking-widest text-cyan mb-4">// Services</p>
              <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
                Everything you need to <span className="text-gradient">launch and grow.</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {services.map((s, i) => {
                const Icon = serviceIcons[i % serviceIcons.length];
                return (
                  <div key={i} className="group relative rounded-2xl glass p-6 transition hover:-translate-y-1 hover:bg-card">
                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "var(--gradient-brand)" }}>
                      <Icon className="h-5 w-5 text-background" />
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-2">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FEATURED PROJECTS */}
        {featured.length > 0 && (
          <section className="relative py-24 px-6 border-y border-border/40">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-cyan mb-4">// Selected work</p>
                  <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Recent <span className="text-gradient">launches.</span></h2>
                </div>
                <Link to="/projects" className="inline-flex items-center gap-2 text-sm font-medium hover:text-cyan transition">
                  View all projects <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {featured.map((p) => (
                  <Link key={p.id} to="/projects" className="group rounded-2xl glass overflow-hidden hover:-translate-y-1 transition">
                    {p.cover_image && (
                      <div className="aspect-[4/3] overflow-hidden">
                        <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="text-xs font-mono uppercase tracking-widest text-cyan">
                        {[p.client_name, p.category].filter(Boolean).join(" · ")}
                      </div>
                      <h3 className="font-display text-xl font-bold mt-2">{p.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* INDUSTRIES */}
        <section id="work" className="relative py-20 border-y border-border/40 overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 mb-8">
            <p className="font-mono text-xs uppercase tracking-widest text-cyan mb-3">// Industries we serve</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold">Every business deserves a beautiful presence.</h2>
          </div>
          <div className="flex flex-wrap gap-3 px-6 max-w-7xl mx-auto">
            {industries.map((i) => (
              <span key={i} className="rounded-full glass px-5 py-2 text-sm font-medium">{i}</span>
            ))}
          </div>
        </section>

        {/* PROCESS */}
        <section id="process" className="relative py-32 px-6">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl mb-16">
              <p className="font-mono text-xs uppercase tracking-widest text-cyan mb-4">// Process</p>
              <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
                A clear path from <span className="text-gradient">idea to impact.</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.map((p) => (
                <div key={p.step} className="relative rounded-2xl glass p-7">
                  <div className="font-mono text-sm text-cyan mb-6">{p.step}</div>
                  <h3 className="font-display text-xl font-bold mb-3">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="relative py-32 px-6">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl mb-16">
              <p className="font-mono text-xs uppercase tracking-widest text-cyan mb-4">// Packages</p>
              <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
                Transparent <span className="text-gradient">pricing tiers.</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {plans.map((p, i) => (
                <div key={i} className={`relative rounded-3xl p-8 ${p.featured ? "glow-border bg-card" : "glass"}`}>
                  {p.featured && (
                    <div className="absolute -top-3 left-8 rounded-full px-3 py-1 text-xs font-mono uppercase tracking-wider text-background" style={{ background: "var(--gradient-brand)" }}>
                      Recommended
                    </div>
                  )}
                  <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{p.tag}</div>
                  <h3 className="font-display text-3xl font-bold mt-2">{p.name}</h3>
                  <p className="mt-2 text-gradient font-display text-2xl font-semibold">{p.price}</p>
                  <ul className="mt-7 space-y-3">
                    {p.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-3 text-sm">
                        <Check className="h-4 w-4 mt-0.5 text-cyan flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="#contact" className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition ${p.featured ? "bg-foreground text-background hover:scale-[1.02]" : "glass hover:bg-card"}`}>
                    Request quote <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="relative py-32 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="relative rounded-3xl glass p-10 md:p-16 overflow-hidden glow-border">
              <div className="absolute -top-32 -right-32 h-72 w-72 rounded-full opacity-40 blur-3xl" style={{ background: "var(--gradient-brand)" }} />
              <div className="relative">
                <p className="font-mono text-xs uppercase tracking-widest text-cyan mb-4">// Let's build</p>
                <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
                  Have a project in mind? <span className="text-gradient">Let's talk.</span>
                </h2>
                <p className="mt-5 text-lg text-muted-foreground max-w-xl">
                  Reach out directly to Yosef Radwan about your project.
                </p>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a href={`tel:${contact.phone}`} className="group flex items-center gap-4 rounded-2xl glass p-5 hover:bg-card transition">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "var(--gradient-brand)" }}>
                      <Phone className="h-5 w-5 text-background" />
                    </div>
                    <div>
                      <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Call</div>
                      <div className="font-display text-lg font-semibold">{contact.phone}</div>
                    </div>
                    <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground" />
                  </a>
                  <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer" className="group flex items-center gap-4 rounded-2xl glass p-5 hover:bg-card transition">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "var(--gradient-brand)" }}>
                      <Mail className="h-5 w-5 text-background" />
                    </div>
                    <div>
                      <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">WhatsApp</div>
                      <div className="font-display text-lg font-semibold">Message Youssef</div>
                    </div>
                    <ExternalLink className="ml-auto h-5 w-5 text-muted-foreground transition group-hover:text-foreground" />
                  </a>
                </div>

                <div className="mt-10 flex items-center gap-3 text-sm text-muted-foreground">
                  <Rocket className="h-4 w-4 text-cyan" />
                  {contact.note}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="relative border-t border-border/40 py-10 px-6">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <img src={logo} alt="" className="h-7 w-7" width={28} height={28} />
              <span className="font-display font-semibold text-foreground">Yosef Radwan</span>
              <span>· © {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-6">
              <span>Designed by Yosef Radwan</span>
              <a href={`tel:${contact.phone}`} className="hover:text-foreground transition">{contact.phone}</a>
              <Link to="/auth" className="hover:text-foreground transition opacity-50">Admin</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
