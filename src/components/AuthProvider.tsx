"use client";

import { useEffect, useState, createContext, useContext, type ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import { Shield, Loader2 } from "lucide-react";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

// Public routes that don't require auth
const PUBLIC_ROUTES = ["/login", "/signup", "/landing", "/"];

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(isSupabaseConfigured);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // If Supabase isn't configured, skip auth entirely (dev mode)
        if (!isSupabaseConfigured) return;

        // Get initial session
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
            setLoading(false);
        });

        // Listen for auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!isSupabaseConfigured || loading) return;
        const isPublic = PUBLIC_ROUTES.includes(pathname);

        if (!user && !isPublic) {
            router.replace("/landing");
        } else if (user && isPublic) {
            router.replace("/dashboard");
        }
    }, [user, loading, pathname, router]);

    const signOut = async () => {
        if (isSupabaseConfigured) {
            await supabase.auth.signOut();
        }
        router.replace("/login");
    };

    // Loading spinner (only when Supabase is configured)
    if (loading) {
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

    // If Supabase isn't configured, render without auth (dev mode)
    if (!isSupabaseConfigured) {
        return (
            <AuthContext.Provider value={{ user: null, loading: false, signOut }}>
                {children}
            </AuthContext.Provider>
        );
    }

    // Hide chrome on public pages
    const isPublic = PUBLIC_ROUTES.includes(pathname);
    if (isPublic) {
        return (
            <AuthContext.Provider value={{ user, loading, signOut }}>
                {children}
            </AuthContext.Provider>
        );
    }

    // Redirect to login if not authenticated
    if (!user) return null;

    return (
        <AuthContext.Provider value={{ user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

