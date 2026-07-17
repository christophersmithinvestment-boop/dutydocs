import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DutyDocsLogo } from "@/components/DutyDocsLogo";
import type { ReactNode } from "react";

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="mb-8">
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>
                {title}
            </h2>
            <div className="space-y-3 text-[0.9375rem] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                {children}
            </div>
        </section>
    );
}

export function LegalPage({
    title,
    updated,
    children,
}: {
    title: string;
    updated: string;
    children: ReactNode;
}) {
    return (
        <div className="min-h-dvh flex flex-col w-full" style={{ color: "var(--color-text-primary)" }}>
            <nav style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--color-border)" }}>
                <div className="flex items-center justify-between" style={{ maxWidth: 768, margin: "0 auto" }}>
                    <Link href="/landing" className="flex items-center gap-2.5">
                        <DutyDocsLogo size={30} />
                        <span className="text-base font-bold">DutyDocs</span>
                    </Link>
                    <Link
                        href="/landing"
                        className="flex items-center gap-2 text-sm font-medium transition-colors"
                        style={{ color: "var(--color-accent)" }}
                    >
                        <ArrowLeft size={15} /> Back to Home
                    </Link>
                </div>
            </nav>

            <main className="flex-1 w-full px-6 py-12" style={{ maxWidth: 768, margin: "0 auto" }}>
                <h1 className="text-3xl font-bold tracking-tight mb-2">{title}</h1>
                <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
                    Last updated: {updated}
                </p>
                <div className="hazard-stripe w-24 mb-10" style={{ height: 3 }} />
                {children}
            </main>

            <footer style={{ borderTop: "1px solid var(--color-border)", padding: "1.5rem" }}>
                <div className="flex items-center justify-between text-[0.8125rem]" style={{ maxWidth: 768, margin: "0 auto", color: "var(--color-text-muted)" }}>
                    <span>© {new Date().getFullYear()} DutyDocs</span>
                    <div className="flex items-center gap-4">
                        <Link href="/privacy" style={{ color: "inherit" }}>Privacy</Link>
                        <Link href="/terms" style={{ color: "inherit" }}>Terms</Link>
                        <Link href="/contact" style={{ color: "inherit" }}>Contact</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
