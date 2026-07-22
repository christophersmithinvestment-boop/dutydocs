"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { getTotalRecordCount } from "@/lib/database";
import { isSupabaseConfigured } from "@/lib/supabase";
import { isClient } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";

// Plan usage is a single number for the whole account (records across
// every module), so it lives in one place rather than in each page's
// useModuleData instance — otherwise the sidebar and the page you are on
// hold separate copies and drift apart.

function countLocalRecords(): number {
    if (!isClient()) return 0;
    let count = 0;
    Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("hs_")) {
            try {
                const data = JSON.parse(localStorage.getItem(key) || "[]");
                if (Array.isArray(data)) count += data.length;
            } catch { }
        }
    });
    return count;
}

interface UsageContextValue {
    /** Records the account holds across all modules. */
    totalRecords: number;
    /** Re-read the authoritative count. */
    refreshUsage: () => Promise<void>;
    /** Optimistic nudge after a confirmed create/delete. */
    adjustUsage: (delta: number) => void;
}

const UsageContext = createContext<UsageContextValue | undefined>(undefined);

export function UsageProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [totalRecords, setTotalRecords] = useState(0);

    const refreshUsage = useCallback(async () => {
        const count = isSupabaseConfigured ? await getTotalRecordCount() : countLocalRecords();
        setTotalRecords(count);
    }, []);

    const adjustUsage = useCallback((delta: number) => {
        setTotalRecords((prev) => Math.max(0, prev + delta));
    }, []);

    // Re-read on sign-in/sign-out as well as on mount — the count is
    // per-account, and on first mount auth may not have resolved yet.
    useEffect(() => {
        refreshUsage();
    }, [user?.id, refreshUsage]);

    return (
        <UsageContext.Provider value={{ totalRecords, refreshUsage, adjustUsage }}>
            {children}
        </UsageContext.Provider>
    );
}

export function useUsage() {
    const context = useContext(UsageContext);
    if (!context) {
        throw new Error("useUsage must be used within a UsageProvider");
    }
    return context;
}
