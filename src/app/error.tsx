"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw, LayoutDashboard } from "lucide-react";

// Route-level error boundary. It sits inside the root layout, so AppShell
// (sidebar, bottom nav, providers) stays mounted and only the page content
// is replaced. Before this existed, one malformed record could throw during
// render and take the entire app down to a blank screen.
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[DutyDocs] Unhandled page error:", error);
    }, [error]);

    return (
        <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-2xl mx-auto">
            <div className="card" style={{ borderColor: "rgba(239,68,68,0.25)" }}>
                <div className="flex flex-col items-center text-center py-6">
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                        style={{ background: "rgba(239,68,68,0.12)", color: "var(--color-safety-red)" }}
                    >
                        <AlertTriangle size={26} />
                    </div>

                    <h1 className="text-lg font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
                        Something went wrong on this page
                    </h1>
                    <p className="text-sm mb-1 max-w-md" style={{ color: "var(--color-text-secondary)" }}>
                        Your saved records are safe. This page couldn&apos;t be displayed — usually
                        because one record is incomplete or in an unexpected format.
                    </p>
                    {error?.message && (
                        <p className="text-xs mt-3 font-mono px-3 py-2 rounded-lg max-w-md break-words"
                            style={{ background: "var(--color-bg-secondary)", color: "var(--color-text-muted)" }}>
                            {error.message}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-3 justify-center mt-6">
                        <button onClick={reset} className="btn btn-primary" style={{ padding: "0.5rem 1rem" }}>
                            <RotateCw size={14} /> Try again
                        </button>
                        <Link href="/dashboard" className="btn btn-secondary" style={{ padding: "0.5rem 1rem" }}>
                            <LayoutDashboard size={14} /> Back to dashboard
                        </Link>
                    </div>

                    <p className="text-xs mt-6" style={{ color: "var(--color-text-muted)" }}>
                        If this keeps happening,{" "}
                        <Link href="/report-bug" style={{ color: "var(--color-accent)" }}>
                            report a bug
                        </Link>{" "}
                        so we can fix it.
                    </p>
                </div>
            </div>
        </div>
    );
}
