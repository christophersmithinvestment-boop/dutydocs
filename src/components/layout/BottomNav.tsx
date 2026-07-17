"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    ClipboardCheck,
    AlertTriangle,
    Search,
    MoreHorizontal,
} from "lucide-react";

const tabs = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/risk-assessment", label: "Assess", icon: ClipboardCheck },
    { href: "/incidents", label: "Report", icon: AlertTriangle },
    { href: "/inspections", label: "Inspect", icon: Search },
    { href: "/more", label: "More", icon: MoreHorizontal },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
            style={{
                background: "rgba(7, 11, 20, 0.85)",
                backdropFilter: "blur(24px) saturate(1.4)",
                WebkitBackdropFilter: "blur(24px) saturate(1.4)",
                borderTop: "1px solid rgba(43, 58, 92, 0.5)",
                boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.4)",
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
        >
            <div className="flex items-center justify-around px-2 py-1">
                {tabs.map((tab) => {
                    const isActive =
                        tab.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(tab.href);
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all duration-200"
                            style={{
                                color: isActive
                                    ? "var(--color-accent-light)"
                                    : "var(--color-text-muted)",
                                background: isActive
                                    ? "linear-gradient(180deg, rgba(20,184,166,0.2), rgba(20,184,166,0.06))"
                                    : "transparent",
                                boxShadow: isActive
                                    ? "inset 0 1px 0 rgba(255,255,255,0.08), 0 0 16px -4px rgba(20,184,166,0.4)"
                                    : "none",
                                minWidth: "60px",
                            }}
                        >
                            <tab.icon
                                size={22}
                                strokeWidth={isActive ? 2.5 : 1.8}
                                style={{
                                    transition: "all 0.2s ease",
                                    transform: isActive ? "scale(1.1)" : "scale(1)",
                                }}
                            />
                            <span
                                className="text-[10px] font-semibold"
                                style={{ letterSpacing: "0.02em" }}
                            >
                                {tab.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
