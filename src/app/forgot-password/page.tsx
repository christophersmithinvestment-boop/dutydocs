"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { DutyDocsLogo } from "@/components/DutyDocsLogo";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (resetError) {
            setError(resetError.message);
        } else {
            setMessage("Check your email for the reset link!");
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
                        Forgot Password
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                        Enter your email and we'll send you a link to reset your password.
                    </p>
                </div>

                {error && (
                    <div className="card mb-4" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--color-safety-red)", fontSize: "13px" }}>
                        {error}
                    </div>
                )}

                {message && (
                    <div className="card mb-4" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", fontSize: "13px" }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleReset} className="space-y-4">
                    <div>
                        <label className="input-label">Email Address</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
                            <input
                                type="email"
                                className="input-field"
                                style={{ paddingLeft: "2.5rem" }}
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ marginTop: "1rem" }}>
                        {loading ? "Sending..." : "Send Reset Link"}
                        {!loading && <Send size={16} />}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <Link href="/login" className="text-sm font-medium flex items-center justify-center gap-1" style={{ color: "var(--color-text-muted)" }}>
                        <ArrowLeft size={14} /> Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
