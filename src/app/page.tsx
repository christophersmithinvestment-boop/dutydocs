"use client";

import { useAuth } from "@/components/AuthProvider";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Shield, Loader2 } from "lucide-react";

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
      style={{ background: "var(--color-bg-primary)" }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(249,115,22,0.15)" }}
      >
        <Shield size={28} style={{ color: "var(--color-accent)" }} />
      </div>
      <Loader2
        size={20}
        className="animate-spin"
        style={{ color: "var(--color-text-muted)" }}
      />
    </div>
  );
}
