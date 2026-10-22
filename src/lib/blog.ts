import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const DIR = path.join(process.cwd(), "content", "blog");

export type Post = { slug: string; title: string; metaTitle: string; description: string; html: string };

function load(slug: string): Post {
    const { data, content } = matter(fs.readFileSync(path.join(DIR, `${slug}.md`), "utf8"));
    const h1 = content.match(/^#\s+(.+)$/m);
    const title = h1 ? h1[1].trim() : String(data.meta_title ?? slug);
    const body = h1 ? content.replace(h1[0], "") : content;
    return {
        slug,
        title,
        metaTitle: String(data.meta_title ?? title),
        description: String(data.meta_description ?? ""),
        html: marked.parse(body, { async: false }) as string,
    };
}

export function getAllPosts(): Post[] {
    return fs.readdirSync(DIR).filter((f) => f.endsWith(".md")).sort().map((f) => load(f.replace(/\.md$/, "")));
}

export function getPost(slug: string): Post | null {
    if (!/^[a-z0-9-]+$/.test(slug) || !fs.existsSync(path.join(DIR, `${slug}.md`))) return null;
    return load(slug);
}
