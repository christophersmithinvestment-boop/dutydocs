"use client";

import { useAuth } from "@/components/AuthProvider";

export const MAX_FREE_RECORDS = 50;
export const CORE_MODULES = [
    "risk_assessments",
    "coshh_assessments",
    "rams",
    "incidents",
    "near_misses",
    "risk_assessment",
    "coshh",
    "near_miss",
];

export const MASTER_EMAILS = [
    "christophersmithinvestment@gmail.com",
    "hello@dutydocsapp.com",
];

// TEMP: dev override for testing — remove before wider rollout.
// Grants full access to all modules for these accounts only. Everyone
// else continues to resolve through `plan` (Stripe -> app_metadata).
// To remove: delete this array and the `isTempTestEmail` term on `isPro`.
//
// This array only unlocks the UI. These accounts also need
// app_metadata.plan = 'pro' or RLS will still refuse their data —
// supabase-tier-rls.sql sets that for them.
const TEMP_TEST_EMAILS = [
    "bianca.byrne1@icloud.com",
];

// Launch mode: billing is not live yet. upgrade() collects waitlist
// interest by email instead of opening Stripe checkout. To re-enable
// billing, restore the /api/stripe/checkout call below.
const WAITLIST_MODE = true;
const WAITLIST_EMAIL = "hello@dutydocsapp.com";

export function useSubscription() {
    const { user } = useAuth();

    const userEmail = user?.email?.toLowerCase() || "";
    const isMasterEmail = MASTER_EMAILS.includes(userEmail);
    // TEMP: dev override for testing — remove before wider rollout.
    const isTempTestEmail = TEMP_TEST_EMAILS.includes(userEmail);

    // Tier is read from app_metadata, which only the service role can write.
    // It used to come from user_metadata, which any signed-in user can set
    // with supabase.auth.updateUser({ data: { plan: "pro" } }) — self-granted
    // Pro, no gating bug required. Everything below is UX only; the real
    // boundary is the RLS policy on `records` (see supabase-tier-rls.sql).
    const plan = user?.app_metadata?.plan || "starter";
    const isPro = plan === "pro" || isMasterEmail || isTempTestEmail;
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
        if (WAITLIST_MODE) {
            const subject = encodeURIComponent("DutyDocs Pro waitlist");
            const body = encodeURIComponent(
                `Hi,\n\nPlease add me to the DutyDocs Pro waitlist.\n\nAccount email: ${user?.email ?? "(not signed in)"}`
            );
            window.location.href = `mailto:${WAITLIST_EMAIL}?subject=${subject}&body=${body}`;
            return;
        }
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
