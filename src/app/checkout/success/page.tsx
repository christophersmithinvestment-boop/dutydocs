"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { DutyDocsLogo } from "@/components/DutyDocsLogo";

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "var(--color-bg-primary)" }}>
            <div className="max-w-md w-full text-center space-y-8 stagger-item">
                <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <CheckCircle2 size={40} className="text-emerald-500" />
                    </div>
                </div>

                <div className="space-y-4">
                    <DutyDocsLogo size={48} className="mx-auto" />
                    <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
                        Welcome to Pro!
                    </h1>
                    <p className="text-lg" style={{ color: "var(--color-text-secondary)" }}>
                        Your subscription has been successfully activated. You now have unlimited access to all 16 modules and advanced features.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="p-4 rounded-2xl border" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
                        <Zap size={20} className="text-amber-500 mb-2" />
                        <h3 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>Unlimited Records</h3>
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>No more limits on your safety documentation.</p>
                    </div>
                    <div className="p-4 rounded-2xl border" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
                        <ShieldCheck size={20} className="text-teal-500 mb-2" />
                        <h3 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>All Modules</h3>
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Full access to Asset Registers, Permits, and more.</p>
                    </div>
                </div>

                <div className="pt-4">
                    <Link
                        href="/dashboard"
                        className="btn btn-primary btn-full flex items-center justify-center gap-2 group py-4 text-lg"
                    >
                        Go to Dashboard
                        <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    A confirmation email has been sent to your inbox.
                </p>
            </div>
        </div>
    );
}
