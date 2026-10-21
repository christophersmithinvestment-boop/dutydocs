import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

// Landing page served at "/" (server-rendered). Signed-in users are sent to
// /dashboard by AuthProvider once their client-side session loads.
const TITLE = "DutyDocs – RAMS, Risk Assessments & COSHH App for UK Contractors";
const DESCRIPTION =
    "Create site-ready RAMS, risk assessments and COSHH in minutes. Log inspections, track training and PPE expiries, export PDFs. Free plan for UK trades.";

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: "/" },
    openGraph: {
        type: "website", url: "/", siteName: "DutyDocs", locale: "en_GB",
        title: TITLE, description: DESCRIPTION,
        images: [{ url: "/icons/icon-512x512.png", width: 512, height: 512, alt: "DutyDocs" }],
    },
    twitter: { card: "summary", title: TITLE, description: DESCRIPTION, images: ["/icons/icon-512x512.png"] },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "DutyDocs",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
    url: "https://www.dutydocsapp.com/",
    description: DESCRIPTION,
    offers: [
        { "@type": "Offer", name: "Starter", price: "0", priceCurrency: "GBP" },
        {
            "@type": "Offer", name: "Pro", price: "19.99", priceCurrency: "GBP",
            priceSpecification: { "@type": "UnitPriceSpecification", price: "19.99", priceCurrency: "GBP", billingDuration: "P1M", unitCode: "MON" },
        },
    ],
};

export default function HomePage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <LandingPage />
        </>
    );
}
