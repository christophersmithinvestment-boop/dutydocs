"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    ClipboardCheck,
    AlertTriangle,
    Search,
    FlaskConical,
    FileText,
    Megaphone,
    ShieldCheck,
    TriangleAlert,
    Settings,
    HardHat,
    Package,
    Monitor,
    Dumbbell,
    Flame,
    HeartPulse,
    GraduationCap,
    Phone,
    Crown,
    Zap,
    Bug,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DutyDocsLogo } from "@/components/DutyDocsLogo";
import { useSubscription } from "@/hooks/useSubscription";
import { useModuleData } from "@/hooks/useModuleData";
import UpgradeModal from "@/components/UpgradeModal";

const navGroups = [
    {
        label: "Main",
        items: [
            { href: "/dashboard", label: "Dashboard", icon: Home },
        ],
    },
    {
        label: "Assessments",
        items: [
            { href: "/risk-assessment", label: "Risk Assessment", icon: ClipboardCheck },
            { href: "/coshh", label: "COSHH", icon: FlaskConical },
            { href: "/rams", label: "Method Statement", icon: FileText },
            { href: "/dse", label: "DSE Assessment", icon: Monitor },
            { href: "/manual-handling", label: "Manual Handling", icon: Dumbbell },
        ],
    },
    {
        label: "Reporting",
        items: [
            { href: "/incidents", label: "Incident Report", icon: AlertTriangle },
            { href: "/near-miss", label: "Near Miss", icon: TriangleAlert },
            { href: "/first-aid", label: "First Aid Log", icon: HeartPulse },
        ],
    },
    {
        label: "Operations",
        items: [
            { href: "/inspections", label: "Site Inspection", icon: Search },
            { href: "/toolbox-talks", label: "Toolbox Talks", icon: Megaphone },
            { href: "/permits", label: "Permits to Work", icon: ShieldCheck },
            { href: "/fire-drills", label: "Fire Drills", icon: Flame },
        ],
    },
    {
        label: "Management",
        items: [
            { href: "/asset-register", label: "Asset Register", icon: Package },
            { href: "/ppe-register", label: "PPE Register", icon: HardHat },
            { href: "/training-records", label: "Training Records", icon: GraduationCap },
            { href: "/emergency-contacts", label: "Emergency Contacts", icon: Phone },
        ],
    },
];

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const { isPro, hasModuleAccess } = useSubscription();
    const { totalRecords } = useModuleData({ module: "risk_assessments", storeKey: "risk_assessments" });
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    return (
        <aside
            className={cn(
                "w-64 h-screen flex-col border-r overflow-y-auto sticky top-0",
                className
            )}
            style={{
                background: "linear-gradient(180deg, rgba(20,184,166,0.04), transparent 220px), var(--color-bg-secondary)",
                borderColor: "var(--color-border)",
            }}
        >
            {/* Logo */}
            <div className="border-b" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex items-center gap-3 px-5 py-5">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full blur-lg" style={{ background: "rgba(20,184,166,0.35)" }} />
                        <DutyDocsLogo size={36} />
                    </div>
                    <div>
                        <h1 className="text-[15px] font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
                            DutyDocs
                        </h1>
                        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>
                            H&S Management
                        </p>
                    </div>
                </div>
                <div className="hazard-stripe mx-5 mb-4" style={{ height: 3 }} />
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-5">
                {navGroups.map((group) => (
                    <div key={group.label}>
                        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
                            {group.label}
                        </p>
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const isActive =
                                    item.href === "/"
                                        ? pathname === "/"
                                        : pathname.startsWith(item.href);
                                const moduleMap: Record<string, string> = {
                                    "/risk-assessment": "risk_assessments",
                                    "/coshh": "coshh_assessments",
                                    "/near-miss": "near_misses",
                                };
                                const moduleName = moduleMap[item.href] || item.href.replace("/", "").replace(/-/g, "_");

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="relative flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group hover:bg-white/[0.03]"
                                        style={{
                                            color: isActive
                                                ? "var(--color-accent-light)"
                                                : "var(--color-text-secondary)",
                                            background: isActive
                                                ? "linear-gradient(90deg, rgba(20,184,166,0.16), rgba(20,184,166,0.04))"
                                                : undefined,
                                            boxShadow: isActive
                                                ? "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 20px -6px rgba(20,184,166,0.25)"
                                                : undefined,
                                        }}
                                    >
                                        {isActive && (
                                            <span
                                                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full"
                                                style={{ background: "var(--color-accent)", boxShadow: "0 0 8px rgba(20,184,166,0.8)" }}
                                            />
                                        )}
                                        <div className="flex items-center gap-3">
                                            <item.icon size={18} strokeWidth={isActive ? 2.2 : 1.6} />
                                            <span>{item.label}</span>
                                        </div>
                                        {!isPro && !hasModuleAccess(moduleName) && (
                                            <Crown size={12} className="text-amber-500/80 group-hover:text-amber-500 transition-colors" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Settings link */}
            <div className="px-3 py-4 border-t space-y-3" style={{ borderColor: "var(--color-border)" }}>
                {!isPro && (
                    <div
                        className="px-4 py-4 rounded-xl relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        onClick={() => setShowUpgradeModal(true)}
                        style={{
                            background: "linear-gradient(135deg, #14b8a6 0%, #0d9488 60%, #0f766e 100%)",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), 0 10px 25px -5px rgba(20, 184, 166, 0.35)",
                        }}
                    >
                        <div className="hazard-stripe absolute top-0 left-0 right-0 rounded-none" style={{ height: 4, opacity: 1 }} />
                        <div className="relative z-10 pt-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                    <Crown size={12} className="text-white" />
                                </div>
                                <span className="text-xs font-bold text-white uppercase tracking-wider">Upgrade to Pro</span>
                            </div>
                            <p className="text-[10px] text-white/90 font-medium mb-3">
                                Get unlimited documents, smart exports & tailored H&S advice.
                            </p>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-[10px] font-bold text-white">
                                    <span>Usage</span>
                                    <span>{totalRecords}/50 Records</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white transition-all duration-500"
                                        style={{ width: `${Math.min(100, (totalRecords / 50) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Decoration */}
                        <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                    </div>
                )}

                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{ color: "var(--color-text-muted)" }}
                >
                    <Settings size={18} strokeWidth={1.6} />
                    <span>Settings</span>
                </Link>

                <Link
                    href="/report-bug"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{ color: "var(--color-text-muted)" }}
                >
                    <Bug size={18} strokeWidth={1.6} />
                    <span>Report a Bug</span>
                </Link>
            </div>

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
            />
        </aside >
    );
}
