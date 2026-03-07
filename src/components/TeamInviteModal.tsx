"use client";

import React, { useState } from "react";
import { X, Mail, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { inviteUserToTeam } from "@/lib/teams";

interface TeamInviteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TeamInviteModal({ isOpen, onClose }: TeamInviteModalProps) {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setError(null);

        try {
            const { success, error: inviteError } = await inviteUserToTeam(email);

            if (success) {
                setSent(true);
                // Reset after a delay
                setTimeout(() => {
                    onClose();
                    setTimeout(() => {
                        setSent(false);
                        setEmail("");
                    }, 300);
                }, 2500);
            } else {
                setError(inviteError || "Failed to send invitation");
            }
        } catch (err) {
            setError("A network error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-[var(--color-bg-primary)] rounded-2xl shadow-2xl border border-[var(--color-border)] p-6 overflow-hidden animate-in zoom-in-95 duration-200">
                {sent ? (
                    <div className="py-8 text-center animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-[var(--color-safety-green)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} style={{ color: "var(--color-safety-green)" }} />
                        </div>
                        <h3 className="text-xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>Invite Sent!</h3>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            An invitation has been sent to <span className="font-semibold">{email}</span>.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>Invite Team Member</h3>
                            <button onClick={onClose} className="p-2 hover:bg-[var(--color-bg-secondary)] rounded-full transition-colors" aria-label="Close invite modal" title="Close">
                                <X size={20} style={{ color: "var(--color-text-muted)" }} />
                            </button>
                        </div>

                        <form onSubmit={handleSend} className="space-y-4">
                            <div>
                                <label className="input-label">Email Address</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="input-field pl-10 w-full"
                                        placeholder="colleague@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs animate-in slide-in-from-top-2">
                                    <AlertCircle size={14} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="bg-[var(--color-accent-subtle)] p-4 rounded-xl border border-[var(--color-accent)]/10 mb-2">
                                <p className="text-xs font-medium leading-relaxed" style={{ color: "var(--color-accent)" }}>
                                    Invited members will be able to view and contribute to your health and safety documents once they accept the email invite.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="btn btn-primary btn-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Send invitation link"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send size={18} />
                                        <span>Send Invitation</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
