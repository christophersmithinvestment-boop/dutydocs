import type { MetadataRoute } from "next";

const BASE = "https://www.dutydocsapp.com";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        { url: `${BASE}/landing`, changeFrequency: "weekly", priority: 1 },
        { url: `${BASE}/signup`, changeFrequency: "monthly", priority: 0.8 },
        { url: `${BASE}/contact`, changeFrequency: "yearly", priority: 0.4 },
        { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
        { url: `${BASE}/terms`, changeFrequency: "yearly", priority: 0.2 },
    ];
}
