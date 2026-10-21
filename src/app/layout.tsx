import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dutydocsapp.com"),
  title: "DutyDocs – RAMS, Risk Assessments & COSHH App for UK Contractors",
  description:
    "Create site-ready RAMS, risk assessments and COSHH in minutes. Log inspections, track training and PPE expiries, export PDFs. Free plan for UK trades.",
  manifest: "/manifest.json",
  // Google Search Console: set NEXT_PUBLIC_GSC_VERIFICATION to the token from the HTML-tag method.
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } }
    : {}),
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DutyDocs",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0a0e1a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={`${inter.className} ${inter.variable} ${spaceGrotesk.variable} min-h-dvh antialiased flex`}
      >
        <AppShell>{children}</AppShell>
        <Analytics />
      </body>
    </html>
  );
}

