"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmOptions {
    title: string;
    /** Shown under the title. Should name the thing being deleted. */
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    /** Styles the confirm button as destructive. Defaults to true. */
    destructive?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | undefined>(undefined);

interface PendingConfirm extends ConfirmOptions {
    resolve: (value: boolean) => void;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [pending, setPending] = useState<PendingConfirm | null>(null);
    const confirmButtonRef = useRef<HTMLButtonElement>(null);

    const confirm = useCallback<ConfirmFn>((options) => {
        return new Promise<boolean>((resolve) => {
            setPending({ ...options, resolve });
        });
    }, []);

    const settle = useCallback((result: boolean) => {
        setPending((current) => {
            current?.resolve(result);
            return null;
        });
    }, []);

    // Escape cancels; focus lands on the confirm button so keyboard users
    // aren't left hunting for it.
    useEffect(() => {
        if (!pending) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") settle(false);
        };
        window.addEventListener("keydown", onKeyDown);
        confirmButtonRef.current?.focus();
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [pending, settle]);

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {pending && (
                <div
                    className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="confirm-dialog-title"
                >
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => settle(false)}
                    />

                    <div className="relative w-full max-w-sm bg-[var(--color-bg-primary)] rounded-3xl overflow-hidden shadow-2xl border border-[var(--color-border)] animate-in slide-in-from-bottom duration-200">
                        <div className="px-6 pt-8 pb-6 text-center">
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                                style={{
                                    background: pending.destructive === false
                                        ? "rgba(20,184,166,0.12)"
                                        : "rgba(239,68,68,0.12)",
                                    color: pending.destructive === false
                                        ? "var(--color-accent)"
                                        : "var(--color-safety-red)",
                                }}
                            >
                                <AlertTriangle size={26} />
                            </div>

                            <h2
                                id="confirm-dialog-title"
                                className="text-lg font-bold mb-2"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {pending.title}
                            </h2>
                            {pending.message && (
                                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                    {pending.message}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3 px-6 pb-6">
                            <button
                                onClick={() => settle(false)}
                                className="btn btn-secondary flex-1"
                            >
                                {pending.cancelLabel ?? "Cancel"}
                            </button>
                            <button
                                ref={confirmButtonRef}
                                onClick={() => settle(true)}
                                className={`btn flex-1 ${pending.destructive === false ? "btn-primary" : "btn-danger"}`}
                            >
                                {pending.confirmLabel ?? "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error("useConfirm must be used within a ConfirmProvider");
    }
    return context;
}
