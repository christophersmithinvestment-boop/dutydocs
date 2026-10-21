import { TESTIMONIALS, STATS, LOGOS } from "@/data/socialProof";

/** Renders nothing unless real data is added to src/data/socialProof.ts */
export function StatsLogoStrip() {
    if (STATS.length === 0 && LOGOS.length === 0) return null;
    return (
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
            {STATS.length > 0 && (
                <div className="flex flex-wrap justify-center gap-10 mb-6">
                    {STATS.map((s) => (
                        <div key={s.label} style={{ textAlign: "center" }}>
                            <p style={{ fontSize: "1.75rem", fontWeight: 800 }}>{s.value}</p>
                            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>{s.label}</p>
                        </div>
                    ))}
                </div>
            )}
            {LOGOS.length > 0 && (
                <div className="flex flex-wrap justify-center items-center gap-8" style={{ opacity: 0.7 }}>
                    {LOGOS.map((l) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={l.name} src={l.src} alt={l.name} style={{ height: 28 }} />
                    ))}
                </div>
            )}
        </section>
    );
}

export function Testimonials() {
    if (TESTIMONIALS.length === 0) return null;
    return (
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "5rem 1.5rem" }}>
            <h2 style={{ textAlign: "center", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, marginBottom: "2.5rem" }}>
                What our customers say
            </h2>
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                {TESTIMONIALS.map((t) => (
                    <figure key={t.name} style={{ padding: "1.5rem", background: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: 16 }}>
                        <blockquote style={{ fontSize: "0.9375rem", lineHeight: 1.6, color: "var(--color-text-secondary)" }}>&ldquo;{t.quote}&rdquo;</blockquote>
                        <figcaption style={{ marginTop: "1rem", fontSize: "0.8125rem" }}>
                            <strong>{t.name}</strong> — {t.role}{t.company ? `, ${t.company}` : ""}
                        </figcaption>
                    </figure>
                ))}
            </div>
        </section>
    );
}
