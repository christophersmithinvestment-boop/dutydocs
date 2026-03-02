import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "SafeGuard – Health & Safety",
  description: "Comprehensive mobile health and safety management app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SafeGuard",
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
    <html lang="en">
      <body
        className={`${inter.className} min-h-dvh antialiased flex`}
        style={{ background: "var(--color-bg-primary)" }}
      >
        {/* Desktop sidebar */}
        <Sidebar className="hidden md:flex" />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto min-h-dvh pb-safe md:pb-0">
          <div className="page-enter">
            {children}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <BottomNav />
      </body>
    </html>
  );
}
