"use client";

import { Crown, X, Check } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
}

export default function UpgradeModal({
    isOpen,
    onClose,
    title = "Unlock DutyDocs Pro",
    description = "You've reached a limit on the Starter plan. Upgrade to Pro to unlock unlimited access."
}: UpgradeModalProps) {
    const { upgrade } = useSubscription();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-[var(--color-bg-primary)] rounded-3xl overflow-hidden shadow-2xl border border-[var(--color-border)] animate-in slide-in-from-bottom duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--color-bg-secondary)] transition-colors text-[var(--color-text-muted)]"
                >
                    <X size={20} />
                </button>

                <div className="pt-10 pb-4 px-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/20">
                        <Crown size={32} color="white" />
                    </div>

                    <h2 className="text-2xl font-bold mb-2 text-[var(--color-text-primary)]">
                        {title}
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-8">
                        {description}
                    </p>

                    <div className="space-y-3 mb-10 text-left bg-[var(--color-bg-secondary)] p-5 rounded-2xl border border-[var(--color-border)]">
                        {[
                            "Unlimited records and reports",
                            "Access to all 16 premium modules",
                            "Priority support & cloud backup",
                            "Export professional PDF documents"
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                    <Check size={12} className="text-emerald-500" />
                                </div>
                                <span className="text-sm font-medium text-[var(--color-text-primary)]">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => upgrade()}
                        className="btn btn-primary w-full py-4 text-base font-bold flex items-center justify-center gap-2 mb-3 shadow-lg shadow-emerald-600/20"
                    >
                        <Crown size={18} /> Upgrade to Pro — £9.99
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full py-3 text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
}
