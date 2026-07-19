"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, User, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { DutyDocsLogo } from "@/components/DutyDocsLogo";

export default function SignupPage() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [marketingConsent, setMarketingConsent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        const { error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    marketing_consent: marketingConsent,
                    // Recorded either way — proof of the opt-in/opt-out decision, not just its current value.
                    marketing_consent_updated_at: new Date().toISOString(),
                },
            },
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        setSuccess(true);
        setLoading(false);
    };

    if (success) {
        return (
            <div
                className="min-h-dvh flex items-center justify-center px-6"
                style={{ background: "transparent" }}
            >
                <div className="w-full max-w-sm text-center">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: "rgba(34,197,94,0.15)" }}
                    >
                        <Mail size={32} style={{ color: "var(--color-safety-green)" }} />
                    </div>
                    <h1
                        className="text-xl font-bold mb-2"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Check your email
                    </h1>
                    <p
                        className="text-sm mb-6"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click the link to activate
                        your account.
                    </p>
                    <Link
                        href="/login"
                        className="btn btn-primary"
                        style={{ display: "inline-flex" }}
                    >
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </div>
            </div>
        );
    }

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
                        Create Account
                    </h1>
                    <p
                        className="text-sm mt-1"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        Start your free DutyDocs trial
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
                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label className="input-label">Full Name</label>
                        <div className="relative">
                            <User
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2"
                                style={{ color: "var(--color-text-muted)" }}
                            />
                            <input
                                type="text"
                                className="input-field"
                                style={{ paddingLeft: "2.5rem" }}
                                placeholder="Chris Smith"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
                    </div>
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
                                type={showPassword ? "text" : "password"}
                                className="input-field"
                                style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                                placeholder="Minimum 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                style={{ color: "var(--color-text-muted)" }}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Confirm Password</label>
                        <div className="relative">
                            <Lock
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2"
                                style={{ color: "var(--color-text-muted)" }}
                            />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className="input-field"
                                style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                style={{ color: "var(--color-text-muted)" }}
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="card card-compact flex items-center justify-between gap-3" style={{ background: "var(--color-bg-secondary)" }}>
                        <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                            Keep me updated on new features and improvements
                        </span>
                        <div
                            className={`toggle flex-shrink-0 ${marketingConsent ? "active" : ""}`}
                            onClick={() => setMarketingConsent((v) => !v)}
                            role="checkbox"
                            aria-checked={marketingConsent}
                            aria-label="Keep me updated on new features and improvements"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    setMarketingConsent((v) => !v);
                                }
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary btn-full"
                        style={{ marginTop: "1.5rem" }}
                    >
                        {loading ? "Creating account..." : "Create Account"}
                        {!loading && <ArrowRight size={16} />}
                    </button>
                </form>

                {/* Bottom link */}
                <div className="text-center mt-6">
                    <Link
                        href="/login"
                        className="text-sm"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        Already have an account?{" "}
                        <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>
                            Sign in
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
