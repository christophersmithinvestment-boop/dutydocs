"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { DutyDocsLogo } from "@/components/DutyDocsLogo";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        const { error: updateError } = await supabase.auth.updateUser({
            password: password,
        });

        if (updateError) {
            setError(updateError.message);
        } else {
            setSuccess(true);
            setMessage("Password updated successfully!");
        }
        setLoading(false);
    };

    return (
        <div
            className="min-h-dvh flex items-center justify-center px-6"
            style={{ background: "transparent" }}
        >
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <DutyDocsLogo size={48} className="mx-auto mb-4" />
                    <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                        Set New Password
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                        Enter your new secure password below.
                    </p>
                </div>

                {error && (
                    <div className="card mb-4" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--color-safety-red)", fontSize: "13px" }}>
                        {error}
                    </div>
                )}

                {success ? (
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-6" style={{ color: "#10b981" }}>
                            <CheckCircle2 size={24} />
                            <span className="font-bold">Password Updated</span>
                        </div>
                        <Link href="/login" className="btn btn-primary btn-full">
                            Sign In Now <ArrowRight size={16} />
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div>
                            <label className="input-label">New Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
                                <input
                                    type="password"
                                    className="input-field"
                                    style={{ paddingLeft: "2.5rem" }}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="input-label">Confirm New Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
                                <input
                                    type="password"
                                    className="input-field"
                                    style={{ paddingLeft: "2.5rem" }}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ marginTop: "1rem" }}>
                            {loading ? "Updating..." : "Update Password"}
                            {!loading && <ArrowRight size={16} />}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
