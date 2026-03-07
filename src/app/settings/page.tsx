"use client";

import { useState, useEffect } from "react";
import { HardHat, Trash2, Users, LogOut, User, Crown, CreditCard, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { useSearchParams } from "next/navigation";
import { TeamInviteModal } from "@/components/TeamInviteModal";
import { getTeamMembers, TeamMember } from "@/lib/teams";

export default function SettingsPage() {
    const [showConfirm, setShowConfirm] = useState(false);
    const { user, signOut } = useAuth();
    const { isPro, isStarter, upgrade, manageSubscription } = useSubscription();
    const searchParams = useSearchParams();
    const upgradeStatus = searchParams.get("upgrade");
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loadingTeam, setLoadingTeam] = useState(true);

    useEffect(() => {
        if (isPro) {
            getTeamMembers().then(members => {
                setTeamMembers(members);
                setLoadingTeam(false);
            });
        } else {
            setLoadingTeam(false);
        }
    }, [isPro]);

    const clearAllData = () => {
        if (typeof window === "undefined") return;
        const keys = Object.keys(localStorage).filter((k) => k.startsWith("hs_"));
        keys.forEach((k) => localStorage.removeItem(k));
        setShowConfirm(false);
        window.location.reload();
    };

    const getDataSize = () => {
        if (typeof window === "undefined") return "0 KB";
        let size = 0;
        Object.keys(localStorage)
            .filter((k) => k.startsWith("hs_"))
            .forEach((k) => {
                size += (localStorage.getItem(k) || "").length * 2;
            });
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-2xl mx-auto">
            <h1 className="text-xl font-bold mb-6" style={{ color: "var(--color-text-primary)" }}>
                Settings
            </h1>

            {/* App Info */}
            <div className="card mb-4">
                <div className="flex items-center gap-3 mb-4">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{
                            background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-dark, var(--color-accent)))",
                        }}
                    >
                        <HardHat size={24} color="white" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>DutyDocs</h2>
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Health & Safety Management v1.0</p>
                    </div>
                </div>
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    A comprehensive mobile toolkit for health and safety professionals. Create risk assessments, COSHH records, RAMS, incident reports, and more.
                </p>
            </div>

            {/* Account */}
            <div className="mb-4">
                <p className="section-header px-1">Account</p>
                <div className="space-y-2">
                    <div className="card card-compact flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--color-accent-subtle)" }}>
                                <User size={16} style={{ color: "var(--color-accent)" }} />
                            </div>
                            <div>
                                <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{user?.user_metadata?.full_name || "User"}</p>
                                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{user?.email}</p>
                            </div>
                        </div>
                        <button onClick={signOut} className="btn btn-ghost" style={{ padding: "0.5rem 1rem", color: "var(--color-safety-red)" }}>
                            <LogOut size={14} /> Sign Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Subscription */}
            <div className="mb-4">
                <p className="section-header px-1">Subscription</p>
                <div className="card">
                    {upgradeStatus === "success" && (
                        <div className="flex items-center gap-2 mb-4 p-3 rounded-xl" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                            <CheckCircle2 size={16} style={{ color: "var(--color-safety-green)" }} />
                            <span className="text-sm font-medium" style={{ color: "var(--color-safety-green)" }}>Welcome to DutyDocs Pro! 🎉</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{
                                    background: isPro ? "rgba(234,179,8,0.1)" : "rgba(20,184,166,0.1)",
                                }}
                            >
                                {isPro ? (
                                    <Crown size={18} style={{ color: "#eab308" }} />
                                ) : (
                                    <Sparkles size={18} style={{ color: "#14b8a6" }} />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                                        {isPro ? "Pro Plan" : "Starter Plan"}
                                    </p>
                                    <span className={`badge ${isPro ? "badge-yellow" : "badge-blue"}`}>
                                        {isPro ? "PRO" : "FREE"}
                                    </span>
                                </div>
                                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                    {isPro ? "Unlimited records, all 16 modules, priority support" : "Up to 50 records, 5 core modules"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {isStarter ? (
                        <button
                            onClick={upgrade}
                            className="btn btn-primary btn-full"
                            style={{ padding: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                        >
                            <Crown size={16} /> Upgrade to Pro — £9.99/month
                        </button>
                    ) : (
                        <button
                            onClick={manageSubscription}
                            className="btn btn-secondary btn-full"
                            style={{ padding: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                        >
                            <CreditCard size={16} /> Manage Subscription
                        </button>
                    )}
                </div>
            </div>

            {/* Team Management */}
            <div className="mb-4">
                <div className="flex items-center justify-between section-header px-1">
                    <span>Team Management</span>
                    {isPro && (
                        <span className="badge badge-yellow text-[9px] py-0.5">PRO</span>
                    )}
                </div>
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--color-bg-secondary)]">
                                <Users size={18} className="text-[var(--color-accent)]" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>Your Team</p>
                                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                    {isPro ? "Manage team access and invitations" : "Upgrade to Pro to invite team members"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        {loadingTeam ? (
                            <div className="animate-pulse flex items-center gap-3 py-2">
                                <div className="w-7 h-7 rounded-full bg-[var(--color-bg-secondary)]" />
                                <div className="h-3 w-32 bg-[var(--color-bg-secondary)] rounded" />
                            </div>
                        ) : teamMembers.length > 0 ? (
                            teamMembers.map((member) => (
                                <div key={member.id} className="flex items-center justify-between py-2 border-b border-[var(--color-border)]/50 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 px-1 rounded-lg transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-[var(--color-accent-subtle)] flex items-center justify-center text-[10px] font-bold text-[var(--color-accent)]">
                                            {(member.full_name || "U")[0].toUpperCase()}
                                        </div>
                                        <span className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>
                                            {member.full_name} {member.id === user?.id && "(You)"}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-[var(--color-accent)] uppercase">
                                        {member.role || (member.id === user?.id ? "Owner" : "Member")}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)]/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-[var(--color-accent-subtle)] flex items-center justify-center text-[10px] font-bold text-[var(--color-accent)]">
                                        {(user?.user_metadata?.full_name || user?.email || "U")[0].toUpperCase()}
                                    </div>
                                    <span className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>
                                        {user?.user_metadata?.full_name || user?.email} (You)
                                    </span>
                                </div>
                                <span className="text-[10px] font-bold text-[var(--color-accent)] uppercase">Owner</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => isPro ? setShowTeamModal(true) : upgrade()}
                        className={`btn ${isPro ? "btn-secondary" : "btn-primary"} btn-full flex items-center justify-center gap-2`}
                        style={{ padding: "0.75rem" }}
                    >
                        <Users size={16} />
                        <span>{isPro ? "Invite Member" : "Upgrade to Invite Team"}</span>
                    </button>
                </div>
            </div>

            {/* Data Management */}
            <div className="mb-4">
                <p className="section-header px-1">Data Management</p>
                <div className="space-y-2">
                    <div className="card card-compact flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>Local Storage Used</p>
                            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Data saved on this device</p>
                        </div>
                        <span className="badge badge-blue">{getDataSize()}</span>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div>
                <p className="section-header px-1" style={{ color: "var(--color-safety-red)" }}>Danger Zone</p>
                <div className="card" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>Clear All Data</p>
                            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                Permanently delete all assessments, reports, and records
                            </p>
                        </div>
                        {!showConfirm ? (
                            <button onClick={() => setShowConfirm(true)} className="btn btn-danger" style={{ padding: "0.5rem 1rem" }}>
                                <Trash2 size={14} /> Clear
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={clearAllData} className="btn btn-danger" style={{ padding: "0.5rem 1rem", fontSize: "12px" }}>
                                    Confirm Delete
                                </button>
                                <button onClick={() => setShowConfirm(false)} className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "12px" }}>
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    Built with ❤️ for workplace safety
                </p>
                <p className="text-[10px] mt-1" style={{ color: "var(--color-text-muted)" }}>
                    © 2026 DutyDocs H&S Management
                </p>
            </div>
            <TeamInviteModal
                isOpen={showTeamModal}
                onClose={() => setShowTeamModal(false)}
            />
        </div>
    );
}
