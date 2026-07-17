"use client";

import { useAuth } from "@/components/AuthProvider";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { DutyDocsLogo } from "@/components/DutyDocsLogo";

/**
 * Root route — redirects based on auth state:
 *  • Logged in  → /dashboard
 *  • Logged out → /landing
 *  • Dev mode (no Supabase) → /dashboard
 */
export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isSupabaseConfigured || user) {
      router.replace("/dashboard");
    } else {
      router.replace("/landing");
    }
  }, [user, loading, router]);

  // Splash loader while deciding
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center gap-4"
      style={{ background: "transparent" }}
    >
      <DutyDocsLogo size={48} />
      <Loader2
        size={20}
        className="animate-spin"
        style={{ color: "var(--color-text-muted)" }}
      />
    </div>
  );
}
