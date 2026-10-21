/**
 * PLACEHOLDER product visual. Swap for real screenshots under /public/screenshots/
 * by passing `src` (e.g. "/screenshots/rams.png"). Without `src` it renders a tidy
 * mock app frame labelled as a preview.
 */
type Props = { title: string; src?: string; accent?: string; rows?: number; tall?: boolean };

export function ScreenshotPlaceholder({ title, src, accent = "#14b8a6", rows = 4, tall = false }: Props) {
    return (
        <div
            aria-label={`${title} preview`}
            style={{
                borderRadius: 14, overflow: "hidden", border: "1px solid var(--color-border)",
                background: "var(--color-bg-card)", boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
            }}
        >
            <div className="flex items-center gap-1.5" style={{ padding: "0.5rem 0.75rem", borderBottom: "1px solid var(--color-border)" }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: "#ef4444" }} />
                <span style={{ width: 8, height: 8, borderRadius: 99, background: "#eab308" }} />
                <span style={{ width: 8, height: 8, borderRadius: 99, background: "#10b981" }} />
                <span style={{ marginLeft: 8, fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>{title}</span>
            </div>
            {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={`${title} screenshot`} style={{ width: "100%", display: "block" }} />
            ) : (
                <div style={{ padding: "1rem", minHeight: tall ? 280 : 140 }} data-placeholder="screenshot">
                    <div style={{ height: 10, width: "45%", borderRadius: 6, background: `${accent}55`, marginBottom: 14 }} />
                    {Array.from({ length: rows }).map((_, i) => (
                        <div key={i} className="flex items-center gap-2" style={{ marginBottom: 10 }}>
                            <span style={{ width: 14, height: 14, borderRadius: 4, background: `${accent}33`, flexShrink: 0 }} />
                            <span style={{ height: 8, flex: 1, maxWidth: `${85 - i * 12}%`, borderRadius: 6, background: "var(--color-border)" }} />
                        </div>
                    ))}
                    <div style={{ marginTop: 12, display: "inline-block", fontSize: "0.625rem", padding: "0.2rem 0.5rem", borderRadius: 6, background: `${accent}22`, color: accent }}>
                        Preview
                    </div>
                </div>
            )}
        </div>
    );
}
