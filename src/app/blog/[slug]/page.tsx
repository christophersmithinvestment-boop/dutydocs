import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/LegalPage";
import { getAllPosts, getPost } from "@/lib/blog";

export const dynamicParams = false;

export function generateStaticParams() {
    return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const post = getPost((await params).slug);
    if (!post) return {};
    return {
        title: `${post.metaTitle} – DutyDocs`,
        description: post.description,
        alternates: { canonical: `/blog/${post.slug}` },
        openGraph: { title: post.metaTitle, description: post.description, type: "article" },
    };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const post = getPost((await params).slug);
    if (!post) notFound();
    return (
        <LegalPage title={post.title}>
            <article className="blog-prose" dangerouslySetInnerHTML={{ __html: post.html }} />
            <p className="mt-8 text-sm"><Link href="/blog" style={{ color: "var(--color-accent)" }}>← All posts</Link></p>
        </LegalPage>
    );
}
