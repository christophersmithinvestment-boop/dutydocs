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
    Monitor,
    Dumbbell,
    Flame,
    HeartPulse,
    GraduationCap,
    Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
            { href: "/rams", label: "RAMS", icon: FileText },
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
            { href: "/ppe-register", label: "PPE Register", icon: HardHat },
            { href: "/training-records", label: "Training Records", icon: GraduationCap },
            { href: "/emergency-contacts", label: "Emergency Contacts", icon: Phone },
        ],
    },
];

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "w-64 h-screen flex-col border-r overflow-y-auto sticky top-0",
                className
            )}
            style={{
                background: "var(--color-bg-secondary)",
                borderColor: "var(--color-border)",
            }}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: "var(--color-border)" }}>
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                        background: "linear-gradient(135deg, var(--color-safety-orange), var(--color-safety-orange-dark))",
                    }}
                >
                    <HardHat size={20} color="white" />
                </div>
                <div>
                    <h1 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                        SafeGuard
                    </h1>
                    <p className="text-[10px] font-medium" style={{ color: "var(--color-text-muted)" }}>
                        H&S Management
                    </p>
                </div>
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
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                                        style={{
                                            color: isActive
                                                ? "var(--color-safety-orange)"
                                                : "var(--color-text-secondary)",
                                            background: isActive
                                                ? "rgba(249, 115, 22, 0.1)"
                                                : "transparent",
                                        }}
                                    >
                                        <item.icon size={18} strokeWidth={isActive ? 2.2 : 1.6} />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Settings link */}
            <div className="px-3 py-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{ color: "var(--color-text-muted)" }}
                >
                    <Settings size={18} strokeWidth={1.6} />
                    <span>Settings</span>
                </Link>
            </div>
        </aside>
    );
}
