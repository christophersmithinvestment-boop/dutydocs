"use client";

import { useSubscription } from "@/hooks/useSubscription";
import { Crown, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import UpgradeModal from "./UpgradeModal";

interface PremiumModuleGuardProps {
    children: React.ReactNode;
    moduleName: string;
}

export default function PremiumModuleGuard({ children, moduleName }: PremiumModuleGuardProps) {
    const { isPro, isStarter, upgrade } = useSubscription();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // If Pro, show children
    if (isPro) {
        return <>{children}</>;
    }

    // If Starter (and not Pro), show the Locked screen
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-12 text-center">
            <div
                className="w-20 h-20 rounded-3xl bg-teal-500/10 flex items-center justify-center mb-8 relative"
                style={{ background: "var(--color-accent-subtle)" }}
            >
                <Lock size={32} className="text-teal-600" style={{ color: "var(--color-accent)" }} />
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                    <Crown size={16} className="text-amber-500" />
                </div>
            </div>

            <h1 className="text-3xl font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>
                {moduleName} is a Pro Feature
            </h1>

            <p className="text-lg mb-10 max-w-md mx-auto" style={{ color: "var(--color-text-muted)" }}>
                Upgrade to DutyDocs Pro to unlock this module and get access to our full suite of health and safety management tools.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link href="/dashboard" className="btn btn-ghost">
                    <ArrowLeft size={18} /> Back to Dashboard
                </Link>
                <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="btn btn-primary px-8 py-3 h-auto text-lg"
                    style={{ background: "linear-gradient(135deg, var(--color-accent) 0%, #0d9488 100%)" }}
                >
                    <Crown size={20} className="mr-2" /> Upgrade to Pro
                </button>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full text-left">
                <div className="card">
                    <p className="font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>Unlimited Records</p>
                    <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Remove the 50-record cap and scale your safety documentation indefinitely.</p>
                </div>
                <div className="card">
                    <p className="font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>Advanced Analytics</p>
                    <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Get deeper insights into risks, trends, and compliance metrics across your sites.</p>
                </div>
                <div className="card">
                    <p className="font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>All 20+ Modules</p>
                    <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Unlock DSE, Permits, Asset Tracking, Fire Safety, and more.</p>
                </div>
            </div>

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                title={`Unlock ${moduleName}`}
            />
        </div>
    );
}
