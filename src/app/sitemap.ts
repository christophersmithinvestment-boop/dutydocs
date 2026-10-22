import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

const BASE = "https://www.dutydocsapp.com";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
        { url: `${BASE}/signup`, changeFrequency: "monthly", priority: 0.8 },
        { url: `${BASE}/blog`, changeFrequency: "weekly", priority: 0.7 },
        ...getAllPosts().map((p) => ({ url: `${BASE}/blog/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
        { url: `${BASE}/contact`, changeFrequency: "yearly", priority: 0.4 },
        { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
        { url: `${BASE}/terms`, changeFrequency: "yearly", priority: 0.2 },
    ];
}
