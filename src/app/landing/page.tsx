"use client";

import Link from "next/link";
import {
    Shield, ClipboardCheck, FlaskConical, FileText, AlertTriangle,
    TriangleAlert, Search, Megaphone, ShieldCheck, Monitor, Dumbbell,
    Flame, HeartPulse, HardHat, GraduationCap, Phone, ArrowRight,
    CheckCircle2, Zap, Lock, ChevronRight, Star,
} from "lucide-react";

const FEATURES = [
    { icon: ClipboardCheck, label: "Risk Assessments", desc: "5×5 matrix scoring with residual risk tracking", color: "#f97316" },
    { icon: FlaskConical, label: "COSHH", desc: "Chemical safety with GHS hazard symbols", color: "#a855f7" },
    { icon: FileText, label: "RAMS", desc: "Multi-step method statements with PPE checklists", color: "#3b82f6" },
    { icon: AlertTriangle, label: "Incident Reports", desc: "RIDDOR-aware reporting with root cause analysis", color: "#ef4444" },
    { icon: TriangleAlert, label: "Near Misses", desc: "Quick-capture close calls with severity rating", color: "#eab308" },
    { icon: Search, label: "Site Inspections", desc: "Checklist-driven audits with scoring", color: "#10b981" },
    { icon: Monitor, label: "DSE Assessments", desc: "Display screen workstation evaluations", color: "#10b981" },
    { icon: Dumbbell, label: "Manual Handling", desc: "TILE assessments with risk controls", color: "#eab308" },
    { icon: Megaphone, label: "Toolbox Talks", desc: "Record briefings with attendee tracking", color: "#f97316" },
    { icon: ShieldCheck, label: "Permits to Work", desc: "Issue, approve, and close permits digitally", color: "#3b82f6" },
    { icon: Flame, label: "Fire Drills", desc: "Log evacuations with timing and outcomes", color: "#ef4444" },
    { icon: HeartPulse, label: "First Aid Log", desc: "Track treatments and restock supplies", color: "#ef4444" },
    { icon: HardHat, label: "PPE Register", desc: "Issue tracking with expiry date alerts", color: "#3b82f6" },
    { icon: GraduationCap, label: "Training Records", desc: "Certificate management with expiry warnings", color: "#10b981" },
    { icon: Phone, label: "Emergency Contacts", desc: "One-tap calling for key safety numbers", color: "#ef4444" },
];

const STEPS = [
    { num: "01", title: "Sign Up Free", desc: "Create your account in seconds — no credit card required.", icon: Zap },
    { num: "02", title: "Log Everything", desc: "Use any of 15 built-in modules to capture safety data from anywhere.", icon: ClipboardCheck },
    { num: "03", title: "Stay Compliant", desc: "Export PDF reports, track expiries, and prove compliance effortlessly.", icon: CheckCircle2 },
];

const PRICING = [
    {
        name: "Starter",
        price: "Free",
        period: "",
        desc: "For individuals and small teams getting started",
        features: ["Up to 50 records", "5 core modules", "PDF export", "Local storage backup"],
        cta: "Get Started",
        popular: false,
    },
    {
        name: "Pro",
        price: "£9.99",
        period: "/month",
        desc: "For growing businesses that need full compliance",
        features: ["Unlimited records", "All 15 modules", "Cloud sync & backup", "Priority support", "Team collaboration", "Expiry alerts"],
        cta: "Start Free Trial",
        popular: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        period: "",
        desc: "For organisations with advanced requirements",
        features: ["Everything in Pro", "Multi-site management", "Custom branding", "SSO & audit logs", "Dedicated account manager", "API access"],
        cta: "Contact Sales",
        popular: false,
    },
];

export default function LandingPage() {
    return (
        <div style={{ background: "var(--color-bg-primary)", color: "var(--color-text-primary)" }}>
            {/* ─── Navbar ──────────────────────────────────────────────── */}
            <nav
                style={{
                    position: "sticky", top: 0, zIndex: 50,
                    background: "rgba(10,14,26,0.85)", backdropFilter: "blur(20px)",
                    borderBottom: "1px solid rgba(30,41,59,0.5)",
                }}
            >
                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }} className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2.5">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
                        >
                            <Shield size={18} color="white" />
                        </div>
                        <span className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>SafeGuard</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="btn btn-ghost" style={{ fontSize: "0.8125rem", padding: "0.5rem 1rem" }}>Sign In</Link>
                        <Link href="/signup" className="btn btn-primary" style={{ fontSize: "0.8125rem", padding: "0.5rem 1.25rem" }}>
                            Get Started <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ─── Hero ──────────────────────────────────────────────── */}
            <section style={{ position: "relative", overflow: "hidden" }}>
                {/* Gradient orbs */}
                <div style={{
                    position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)",
                    width: 800, height: 600, background: "radial-gradient(ellipse, rgba(249,115,22,0.12) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />
                <div style={{
                    position: "absolute", top: 100, right: -200,
                    width: 400, height: 400, background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />

                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "6rem 1.5rem 5rem", textAlign: "center", position: "relative" }}>
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 mb-6" style={{
                        padding: "0.375rem 1rem", borderRadius: 999,
                        background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)",
                        fontSize: "0.8125rem", fontWeight: 600, color: "#fb923c",
                    }}>
                        <Star size={14} /> Now with cloud sync
                    </div>

                    <h1 style={{
                        fontSize: "clamp(2.25rem, 6vw, 4rem)", fontWeight: 800, lineHeight: 1.1,
                        letterSpacing: "-0.02em", maxWidth: 800, margin: "0 auto 1.5rem",
                    }}>
                        Health & Safety
                        <br />
                        <span style={{
                            background: "linear-gradient(135deg, #f97316, #fb923c, #f59e0b)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        }}>
                            Made Simple
                        </span>
                    </h1>

                    <p style={{
                        fontSize: "clamp(1rem, 2.5vw, 1.25rem)", color: "var(--color-text-secondary)",
                        maxWidth: 600, margin: "0 auto 2.5rem", lineHeight: 1.6,
                    }}>
                        15 purpose-built modules to manage risk assessments, incidents, inspections, training, and more — all from your phone or desktop.
                    </p>

                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        <Link href="/signup" className="btn btn-primary" style={{ padding: "0.875rem 2rem", fontSize: "1rem" }}>
                            Start Free <ArrowRight size={16} />
                        </Link>
                        <a href="#features" className="btn btn-secondary" style={{ padding: "0.875rem 2rem", fontSize: "1rem" }}>
                            See Features
                        </a>
                    </div>

                    {/* Trust bar */}
                    <div className="flex items-center justify-center gap-6 flex-wrap mt-12" style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem" }}>
                        <span className="flex items-center gap-1.5"><Lock size={14} /> End-to-end encryption</span>
                        <span className="flex items-center gap-1.5"><Shield size={14} /> UK GDPR compliant</span>
                        <span className="flex items-center gap-1.5"><Zap size={14} /> Works offline (PWA)</span>
                    </div>
                </div>
            </section>

            {/* ─── Features Grid ──────────────────────────────────────── */}
            <section id="features" style={{ maxWidth: 1200, margin: "0 auto", padding: "5rem 1.5rem" }}>
                <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                    <p className="section-header" style={{ color: "#f97316", letterSpacing: "0.12em" }}>MODULES</p>
                    <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>
                        Everything You Need
                    </h2>
                    <p style={{ color: "var(--color-text-secondary)", maxWidth: 500, margin: "0.75rem auto 0", fontSize: "1.0625rem" }}>
                        15 specialised modules covering every area of workplace health & safety compliance.
                    </p>
                </div>

                <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
                    {FEATURES.map((f, i) => (
                        <div
                            key={f.label}
                            className="stagger-item"
                            style={{
                                animationDelay: `${i * 40}ms`,
                                padding: "1.25rem",
                                background: "var(--color-bg-card)",
                                border: "1px solid var(--color-border)",
                                borderRadius: 16,
                                transition: "all 0.25s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = `${f.color}40`;
                                e.currentTarget.style.background = "var(--color-bg-card-hover)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "var(--color-border)";
                                e.currentTarget.style.background = "var(--color-bg-card)";
                            }}
                        >
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                                style={{ background: `${f.color}15` }}
                            >
                                <f.icon size={20} style={{ color: f.color }} />
                            </div>
                            <p className="text-sm font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>{f.label}</p>
                            <p className="text-xs" style={{ color: "var(--color-text-muted)", lineHeight: 1.5 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── How It Works ──────────────────────────────────────── */}
            <section style={{
                background: "linear-gradient(180deg, var(--color-bg-secondary) 0%, var(--color-bg-primary) 100%)",
                padding: "5rem 1.5rem",
            }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                        <p className="section-header" style={{ color: "#10b981", letterSpacing: "0.12em" }}>HOW IT WORKS</p>
                        <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>
                            Up and Running in Minutes
                        </h2>
                    </div>

                    <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", maxWidth: 960, margin: "0 auto" }}>
                        {STEPS.map((step, i) => (
                            <div key={step.num} className="stagger-item" style={{ animationDelay: `${i * 100}ms`, textAlign: "center" }}>
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                    style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}
                                >
                                    <step.icon size={28} style={{ color: "#10b981" }} />
                                </div>
                                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10b981", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                                    STEP {step.num}
                                </p>
                                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>{step.title}</h3>
                                <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Pricing ──────────────────────────────────────────── */}
            <section id="pricing" style={{ maxWidth: 1200, margin: "0 auto", padding: "5rem 1.5rem" }}>
                <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                    <p className="section-header" style={{ color: "#3b82f6", letterSpacing: "0.12em" }}>PRICING</p>
                    <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>
                        Simple, Transparent Pricing
                    </h2>
                    <p style={{ color: "var(--color-text-secondary)", maxWidth: 500, margin: "0.75rem auto 0", fontSize: "1.0625rem" }}>
                        Start free. Upgrade when you need more power.
                    </p>
                </div>

                <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", maxWidth: 960, margin: "0 auto" }}>
                    {PRICING.map((plan) => (
                        <div
                            key={plan.name}
                            style={{
                                padding: "2rem",
                                background: plan.popular ? "linear-gradient(135deg, rgba(249,115,22,0.08), rgba(249,115,22,0.02))" : "var(--color-bg-card)",
                                border: plan.popular ? "2px solid rgba(249,115,22,0.4)" : "1px solid var(--color-border)",
                                borderRadius: 20,
                                position: "relative",
                                transition: "all 0.25s ease",
                            }}
                        >
                            {plan.popular && (
                                <div style={{
                                    position: "absolute", top: -1, left: "50%", transform: "translate(-50%, -50%)",
                                    background: "linear-gradient(135deg, #f97316, #ea580c)",
                                    color: "white", fontSize: "0.6875rem", fontWeight: 700,
                                    padding: "0.25rem 1rem", borderRadius: 999, letterSpacing: "0.05em",
                                }}>
                                    MOST POPULAR
                                </div>
                            )}

                            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.5rem" }}>{plan.name}</h3>
                            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>{plan.desc}</p>

                            <div className="flex items-baseline gap-1 mb-6">
                                <span style={{ fontSize: "2.5rem", fontWeight: 800 }}>{plan.price}</span>
                                {plan.period && <span style={{ fontSize: "0.9375rem", color: "var(--color-text-muted)" }}>{plan.period}</span>}
                            </div>

                            <ul style={{ listStyle: "none", marginBottom: "2rem" }} className="space-y-2.5">
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-center gap-2.5" style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                        <CheckCircle2 size={16} style={{ color: plan.popular ? "#f97316" : "#10b981", flexShrink: 0 }} />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/signup"
                                className={`btn btn-full ${plan.popular ? "btn-primary" : "btn-secondary"}`}
                                style={{ padding: "0.875rem", fontSize: "0.9375rem" }}
                            >
                                {plan.cta} <ChevronRight size={16} />
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── CTA Banner ──────────────────────────────────────── */}
            <section style={{ padding: "0 1.5rem 5rem" }}>
                <div style={{
                    maxWidth: 960, margin: "0 auto", padding: "3.5rem 2rem", textAlign: "center",
                    borderRadius: 24,
                    background: "linear-gradient(135deg, rgba(249,115,22,0.12), rgba(234,88,12,0.06))",
                    border: "1px solid rgba(249,115,22,0.2)",
                }}>
                    <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2rem)", fontWeight: 800, marginBottom: "1rem" }}>
                        Ready to Transform Your Safety Management?
                    </h2>
                    <p style={{ color: "var(--color-text-secondary)", maxWidth: 500, margin: "0 auto 2rem", fontSize: "1.0625rem" }}>
                        Join thousands of safety professionals who trust SafeGuard to keep their teams safe and their paperwork sorted.
                    </p>
                    <Link href="/signup" className="btn btn-primary" style={{ padding: "0.875rem 2.5rem", fontSize: "1rem" }}>
                        Get Started Free <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            {/* ─── Footer ──────────────────────────────────────────── */}
            <footer style={{
                borderTop: "1px solid var(--color-border)",
                padding: "2.5rem 1.5rem",
            }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }} className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
                        >
                            <Shield size={14} color="white" />
                        </div>
                        <span className="text-sm font-bold">SafeGuard</span>
                    </div>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                        © {new Date().getFullYear()} SafeGuard. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4" style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                        <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Privacy</a>
                        <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Terms</a>
                        <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
