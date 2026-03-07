"use client";

import { useAuth } from "@/components/AuthProvider";

export const MAX_FREE_RECORDS = 50;
export const CORE_MODULES = [
    "risk_assessments",
    "coshh_assessments",
    "rams",
    "incidents",
    "near_misses",
];

export const MASTER_EMAILS = ["chris@dutydocs.com", "admin@dutydocs.com"];

export function useSubscription() {
    const { user } = useAuth();

    const userEmail = user?.email?.toLowerCase() || "";
    const isMasterEmail = MASTER_EMAILS.includes(userEmail);

    const plan = user?.user_metadata?.plan || "starter";
    const isPro = plan === "pro" || isMasterEmail;
    const isStarter = !isPro;
    const stripeCustomerId = user?.user_metadata?.stripe_customer_id || null;

    const hasModuleAccess = (moduleName: string) => {
        if (isPro) return true;
        return CORE_MODULES.includes(moduleName);
    };

    const isLimitReached = (totalRecords: number) => {
        if (isPro) return false;
        return totalRecords >= MAX_FREE_RECORDS;
    };

    const upgrade = async () => {
        if (!user?.email || !user?.id) return;
        try {
            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: user.email, userId: user.id }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error("[DutyDocs] Upgrade error:", error);
        }
    };

    const manageSubscription = async () => {
        if (!stripeCustomerId) return;
        try {
            const res = await fetch("/api/stripe/portal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customerId: stripeCustomerId }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error("[DutyDocs] Portal error:", error);
        }
    };

    return {
        plan,
        isPro,
        isStarter,
        stripeCustomerId,
        upgrade,
        manageSubscription,
        hasModuleAccess,
        isLimitReached,
    };
}
