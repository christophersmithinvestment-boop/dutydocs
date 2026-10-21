/**
 * Social proof data for the landing page.
 *
 * IMPORTANT: Only add REAL, permissioned testimonials, stats and customer logos.
 * Sections render nothing while these arrays are empty, so nothing fake ships.
 * Example shapes are left commented out below as placeholders.
 */

export type Testimonial = { quote: string; name: string; role: string; company?: string };
export type Stat = { value: string; label: string };
export type Logo = { name: string; src: string };

export const TESTIMONIALS: Testimonial[] = [
    // PLACEHOLDER — replace with a real customer quote (with permission):
    // { quote: "We put our RAMS together on site in minutes.", name: "Jane Doe", role: "Director", company: "Example Electrical Ltd" },
];

export const STATS: Stat[] = [
    // PLACEHOLDER — only use figures you can back up from real data:
    // { value: "1,000+", label: "RAMS created" },
];

export const LOGOS: Logo[] = [
    // PLACEHOLDER — files under /public/logos/, real customers only:
    // { name: "Example Ltd", src: "/logos/example.svg" },
];
