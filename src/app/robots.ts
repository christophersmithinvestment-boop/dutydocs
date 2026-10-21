import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: { userAgent: "*", allow: ["/landing", "/privacy", "/terms", "/contact", "/signup", "/login"], disallow: ["/api/", "/dashboard", "/settings", "/checkout"] },
        sitemap: "https://www.dutydocsapp.com/sitemap.xml",
    };
}
