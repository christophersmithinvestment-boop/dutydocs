"use client";

import Link from "next/link";
import {
    ClipboardCheck,
    FlaskConical,
    FileText,
    AlertTriangle,
    TriangleAlert,
    Search,
    Megaphone,
    ShieldCheck,
    Settings,
    ChevronRight,
    HardHat,
    Monitor,
    Dumbbell,
    Flame,
    HeartPulse,
    GraduationCap,
    Phone,
    ShieldAlert,
} from "lucide-react";
import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradeModal from "@/components/UpgradeModal";

const sections = [
    {
        title: "Assessments",
        items: [
            { href: "/risk-assessment", label: "Risk Assessment", icon: ClipboardCheck, color: "var(--color-safety-orange)" },
            { href: "/coshh", label: "COSHH Assessment", icon: FlaskConical, color: "var(--color-safety-purple)" },
            { href: "/rams", label: "RAMS", icon: FileText, color: "var(--color-safety-blue)" },
            { href: "/dse", label: "DSE Assessment", icon: Monitor, color: "var(--color-safety-green)" },
            { href: "/manual-handling", label: "Manual Handling", icon: Dumbbell, color: "var(--color-safety-yellow)" },
        ],
    },
    {
        title: "Reporting",
        items: [
            { href: "/incidents", label: "Incident Report", icon: AlertTriangle, color: "var(--color-safety-red)" },
            { href: "/near-miss", label: "Near Miss Report", icon: TriangleAlert, color: "var(--color-safety-yellow)" },
            { href: "/first-aid", label: "First Aid Log", icon: HeartPulse, color: "var(--color-safety-red)" },
        ],
    },
    {
        title: "Operations",
        items: [
            { href: "/inspections", label: "Site Inspection", icon: Search, color: "var(--color-safety-green)" },
            { href: "/toolbox-talks", label: "Toolbox Talks", icon: Megaphone, color: "var(--color-safety-orange)" },
            { href: "/permits", label: "Permits to Work", icon: ShieldCheck, color: "var(--color-safety-blue)" },
            { href: "/fire-drills", label: "Fire Drill Log", icon: Flame, color: "var(--color-safety-red)" },
        ],
    },
    {
        title: "Management",
        items: [
            { href: "/ppe-register", label: "PPE Register", icon: HardHat, color: "var(--color-safety-blue)" },
            { href: "/training-records", label: "Training Records", icon: GraduationCap, color: "var(--color-safety-green)" },
            { href: "/emergency-contacts", label: "Emergency Contacts", icon: Phone, color: "var(--color-safety-red)" },
        ],
    },
    {
        title: "Settings",
        items: [
            { href: "/settings", label: "App Settings", icon: Settings, color: "var(--color-text-muted)" },
        ],
    },
];

export default function MorePage() {
    const { hasModuleAccess } = useSubscription();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: "", description: "" });

    return (
        <div className="px-4 pt-6 pb-28">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                        background: "linear-gradient(135deg, var(--color-safety-orange), var(--color-safety-orange-dark))",
                    }}
                >
                    <HardHat size={22} color="white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                        DutyDocs
                    </h1>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        All Tools & Modules
                    </p>
                </div>
            </div>

            {/* Sections */}
            <div className="space-y-6">
                {sections.map((section) => (
                    <div key={section.title}>
                        <p className="section-header px-1">{section.title}</p>
                        <div className="space-y-1.5">
                            {section.items.map((item, i) => {
                                const moduleName = item.href.replace("/", "").replace(/-/g, "_");
                                const isLocked = !hasModuleAccess(moduleName) && section.title !== "Settings";

                                return (
                                    <button
                                        key={item.href}
                                        onClick={() => {
                                            if (isLocked) {
                                                setModalConfig({
                                                    title: "Unlock Premium Module",
                                                    description: `The ${item.label} module is exclusive to DutyDocs Pro users.`
                                                });
                                                setShowUpgradeModal(true);
                                            } else {
                                                window.location.href = item.href;
                                            }
                                        }}
                                        className="card card-compact flex items-center gap-3 stagger-item w-full group"
                                        style={{
                                            animationDelay: `${i * 50}ms`,
                                            cursor: "pointer",
                                        }}
                                    >
                                        <div
                                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ background: `${item.color}15` }}
                                        >
                                            <item.icon size={18} style={{ color: item.color }} />
                                        </div>
                                        <span
                                            className="flex-1 text-sm font-medium text-left"
                                            style={{ color: isLocked ? "var(--color-text-muted)" : "var(--color-text-primary)" }}
                                        >
                                            {item.label}
                                        </span>
                                        {isLocked ? (
                                            <ShieldAlert size={16} className="text-amber-500" />
                                        ) : (
                                            <ChevronRight size={16} style={{ color: "var(--color-text-muted)" }} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                title={modalConfig.title}
                description={modalConfig.description}
            />
        </div>
    );
}
