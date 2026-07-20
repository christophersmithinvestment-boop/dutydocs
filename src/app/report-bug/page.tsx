"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { generateId } from "@/lib/utils";
import { useModuleData } from "@/hooks/useModuleData";
import { useToast } from "@/components/ui/Toast";
import { MODULES } from "@/lib/modules";

interface BugReport {
    id: string;
    title: string;
    description: string;
    module: string;
    severity: "minor" | "moderate" | "blocking";
    createdAt: string;
}

const SEVERITIES: { value: BugReport["severity"]; label: string }[] = [
    { value: "minor", label: "Minor — cosmetic, doesn't block usage" },
    { value: "moderate", label: "Moderate — annoying but there's a workaround" },
    { value: "blocking", label: "Blocking — can't complete the task" },
];

const EMPTY_FORM = {
    title: "",
    description: "",
    module: "general",
    severity: "minor" as BugReport["severity"],
};

export default function ReportBugPage() {
    const { addItem } = useModuleData<BugReport>({ module: "bug_reports", storeKey: "bug_reports" });
    const { showToast } = useToast();
    const [form, setForm] = useState(EMPTY_FORM);

    const handleSubmit = () => {
        if (!form.title.trim() || !form.description.trim()) return;

        addItem({ id: generateId(), ...form, createdAt: new Date().toISOString() });
        showToast("Bug report submitted!");
        setForm(EMPTY_FORM);
    };

    return (
        <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-2xl mx-auto">
            <Link href="/dashboard" className="btn btn-ghost mb-4" style={{ padding: "0.5rem 0" }}>
                <ArrowLeft size={18} /> Back
            </Link>
            <h1 className="text-xl font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>
                Report a Bug
            </h1>
            <p className="text-xs mb-6" style={{ color: "var(--color-text-muted)" }}>
                Spotted something broken? Let us know and we&apos;ll take a look.
            </p>

            <div className="space-y-4">
                <div>
                    <label className="input-label">Summary *</label>
                    <input
                        className="input-field"
                        placeholder="Short summary of the issue"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                </div>

                <div>
                    <label className="input-label">Description *</label>
                    <textarea
                        className="input-field"
                        placeholder="What happened? What did you expect to happen instead?"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="input-label">Module</label>
                        <select
                            className="input-field"
                            value={form.module}
                            onChange={(e) => setForm({ ...form, module: e.target.value })}
                        >
                            <option value="general">General / App-wide</option>
                            {MODULES.map((m) => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="input-label">Severity</label>
                        <select
                            className="input-field"
                            value={form.severity}
                            onChange={(e) => setForm({ ...form, severity: e.target.value as BugReport["severity"] })}
                        >
                            {SEVERITIES.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button onClick={handleSubmit} className="btn btn-primary btn-full mt-4">
                    Submit Bug Report
                </button>
            </div>
        </div>
    );
}
