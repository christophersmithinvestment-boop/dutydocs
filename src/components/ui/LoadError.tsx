"use client";

import { AlertTriangle, RotateCw } from "lucide-react";

// Shown in place of a module's list when the records could not be read.
// Deliberately distinct from the empty state: "we couldn't load this" and
// "you haven't added anything yet" are different situations.
export function LoadError({ message, onRetry }: { message: string; onRetry?: () => void }) {
    return (
        <div className="empty-state">
            <AlertTriangle
                size={40}
                style={{ color: "var(--color-safety-red)", marginBottom: "1rem" }}
            />
            <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                Couldn&apos;t load these records
            </p>
            <p className="text-xs mt-1 max-w-sm" style={{ color: "var(--color-text-muted)" }}>
                {message}
            </p>
            {onRetry && (
                <button onClick={onRetry} className="btn btn-secondary mt-4" style={{ padding: "0.5rem 1rem" }}>
                    <RotateCw size={14} /> Try again
                </button>
            )}
        </div>
    );
}
