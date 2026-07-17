"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, ArrowRight, UserPlus } from "lucide-react";
import Link from "next/link";
import { DutyDocsLogo } from "@/components/DutyDocsLogo";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        window.location.href = "/";
    };

    const handleGoogleLogin = async () => {
        const { error: authError } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/` },
        });
        if (authError) setError(authError.message);
    };

    return (
        <div
            className="min-h-dvh flex items-center justify-center px-6"
            style={{ background: "transparent" }}
        >
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mx-auto mb-4">
                        <DutyDocsLogo size={56} />
                    </div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        DutyDocs
                    </h1>
                    <p
                        className="text-sm mt-1"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        Health &amp; Safety Management
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div
                        className="card mb-4"
                        style={{
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.3)",
                            color: "var(--color-safety-red)",
                            fontSize: "13px",
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="input-label">Email</label>
                        <div className="relative">
                            <Mail
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2"
                                style={{ color: "var(--color-text-muted)" }}
                            />
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
                    <div>
                        <label className="input-label">Password</label>
                        <div className="relative">
                            <Lock
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2"
                                style={{ color: "var(--color-text-muted)" }}
                            />
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
                        <div className="flex justify-end mt-1">
                            <Link
                                href="/forgot-password"
                                className="text-xs font-medium"
                                style={{ color: "var(--color-text-muted)" }}
                            >
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary btn-full"
                        style={{ marginTop: "1.5rem" }}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                        {!loading && <ArrowRight size={16} />}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                    <div
                        className="flex-1 h-px"
                        style={{ background: "var(--color-border)" }}
                    ></div>
                    <span
                        className="text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        or
                    </span>
                    <div
                        className="flex-1 h-px"
                        style={{ background: "var(--color-border)" }}
                    ></div>
                </div>

                {/* Google */}
                <button
                    onClick={handleGoogleLogin}
                    className="btn btn-full"
                    style={{
                        background: "var(--color-bg-card)",
                        color: "var(--color-text-primary)",
                        border: "1px solid var(--color-border)",
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 18 18">
                        <path
                            fill="#4285F4"
                            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                        />
                        <path
                            fill="#34A853"
                            d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                        />
                        <path
                            fill="#EA4335"
                            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                        />
                    </svg>
                    Continue with Google
                </button>

                {/* Bottom links */}
                <div className="text-center mt-6">
                    <Link
                        href="/signup"
                        className="text-sm font-medium flex items-center justify-center gap-1"
                        style={{ color: "var(--color-accent)" }}
                    >
                        <UserPlus size={14} />
                        Create an account
                    </Link>
                </div>
            </div>
        </div>
    );
}
