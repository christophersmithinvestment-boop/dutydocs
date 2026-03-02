"use client";

import { useState } from "react";
import { HardHat, Trash2, Download, RotateCcw } from "lucide-react";

export default function SettingsPage() {
    const [showConfirm, setShowConfirm] = useState(false);

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
                            background: "linear-gradient(135deg, var(--color-safety-orange), var(--color-safety-orange-dark))",
                        }}
                    >
                        <HardHat size={24} color="white" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>SafeGuard</h2>
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Health & Safety Management v1.0</p>
                    </div>
                </div>
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    A comprehensive mobile toolkit for health and safety professionals. Create risk assessments, COSHH records, RAMS, incident reports, and more — all stored locally on your device.
                </p>
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
                    © 2026 SafeGuard H&S Management
                </p>
            </div>
        </div>
    );
}
