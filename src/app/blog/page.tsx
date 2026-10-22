import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
    title: "Blog – DutyDocs",
    description: "Practical guides for small UK builders and contractors on RAMS, COSHH, training records and site paperwork.",
    alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
    const posts = getAllPosts();
    return (
        <LegalPage title="Blog" subtitle="Practical guides for small builders and contractors">
            <div className="space-y-6">
                {posts.map((p) => (
                    <Link key={p.slug} href={`/blog/${p.slug}`} className="block card p-5" style={{ border: "1px solid var(--color-border)", borderRadius: 12 }}>
                        <h2 className="text-lg font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>{p.title}</h2>
                        <p className="text-[0.9375rem]" style={{ color: "var(--color-text-secondary)" }}>{p.description}</p>
                        <span className="text-sm font-medium mt-3 inline-block" style={{ color: "var(--color-accent)" }}>Read more →</span>
                    </Link>
                ))}
            </div>
        </LegalPage>
    );
}
