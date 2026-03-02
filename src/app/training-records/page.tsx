"use client";

import { useState, useEffect } from "react";
import { Plus, GraduationCap, ArrowLeft, Trash2, AlertCircle } from "lucide-react";
import { loadFromStore, saveToStore, generateId, formatDate } from "@/lib/utils";

interface TrainingRecord {
    id: string;
    employeeName: string;
    department: string;
    courseName: string;
    courseType: string;
    provider: string;
    dateCompleted: string;
    expiryDate: string;
    certificateRef: string;
    status: "valid" | "expiring" | "expired" | "pending";
    notes: string;
    createdAt: string;
}

const STORE_KEY = "training_records";

const COURSE_TYPES = [
    "Fire Safety", "First Aid at Work", "Emergency First Aid", "Manual Handling",
    "Working at Height", "Confined Space", "Asbestos Awareness", "COSHH",
    "Abrasive Wheels", "PAT Testing", "Scaffold Inspection", "Banksman/Slinger",
    "Fork Lift (Counterbalance)", "Fork Lift (Reach)", "MEWP/Cherry Picker",
    "Telehandler", "SMSTS", "SSSTS", "CSCS Card", "IOSH Managing Safely",
    "IOSH Working Safely", "NEBOSH General Certificate", "DSE User",
    "Legionella Awareness", "Food Hygiene", "Safeguarding", "Other",
];

export default function TrainingRecordsPage() {
    const [items, setItems] = useState<TrainingRecord[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        employeeName: "", department: "", courseName: "", courseType: "",
        provider: "", dateCompleted: "", expiryDate: "", certificateRef: "", notes: "",
    });

    useEffect(() => {
        const raw = loadFromStore<TrainingRecord[]>(STORE_KEY, []);
        // Auto-update status based on dates
        const updated = raw.map((r) => {
            if (!r.expiryDate) return { ...r, status: "valid" as const };
            const exp = new Date(r.expiryDate);
            const now = new Date();
            const diff = exp.getTime() - now.getTime();
            if (diff < 0) return { ...r, status: "expired" as const };
            if (diff < 30 * 24 * 60 * 60 * 1000) return { ...r, status: "expiring" as const };
            return { ...r, status: "valid" as const };
        });
        setItems(updated);
    }, []);

    const handleSave = () => {
        if (!form.employeeName.trim() || !form.courseName.trim()) return;
        let status: TrainingRecord["status"] = "valid";
        if (form.expiryDate) {
            const diff = new Date(form.expiryDate).getTime() - Date.now();
            if (diff < 0) status = "expired";
            else if (diff < 30 * 24 * 60 * 60 * 1000) status = "expiring";
        }
        const newItem: TrainingRecord = { id: generateId(), ...form, status, createdAt: new Date().toISOString() };
        const updated = [newItem, ...items];
        setItems(updated);
        saveToStore(STORE_KEY, updated);
        setShowForm(false);
        setForm({ employeeName: "", department: "", courseName: "", courseType: "", provider: "", dateCompleted: "", expiryDate: "", certificateRef: "", notes: "" });
    };

    const handleDelete = (id: string) => { const updated = items.filter((i) => i.id !== id); setItems(updated); saveToStore(STORE_KEY, updated); };

    const statusBadge = (s: string) => { switch (s) { case "valid": return { class: "badge-green", label: "Valid" }; case "expiring": return { class: "badge-yellow", label: "Expiring Soon" }; case "expired": return { class: "badge-red", label: "Expired" }; case "pending": return { class: "badge-blue", label: "Pending" }; default: return { class: "badge-blue", label: s }; } };

    const expiredCount = items.filter((i) => i.status === "expired").length;
    const expiringCount = items.filter((i) => i.status === "expiring").length;

    if (showForm) {
        return (
            <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-2xl mx-auto">
                <button onClick={() => setShowForm(false)} className="btn btn-ghost mb-4" style={{ padding: "0.5rem 0" }}><ArrowLeft size={18} /> Back</button>
                <h1 className="text-xl font-bold mb-6" style={{ color: "var(--color-text-primary)" }}>Add Training Record</h1>
                <div className="space-y-4">
                    <div><label className="input-label">Employee Name *</label><input className="input-field" placeholder="Full name" value={form.employeeName} onChange={(e) => setForm({ ...form, employeeName: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="input-label">Department</label><input className="input-field" placeholder="e.g. Site Ops" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
                        <div><label className="input-label">Course Type</label>
                            <select className="input-field" value={form.courseType} onChange={(e) => setForm({ ...form, courseType: e.target.value, courseName: form.courseName || e.target.value })}>
                                <option value="">Select...</option>
                                {COURSE_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div><label className="input-label">Course / Certificate Name *</label><input className="input-field" placeholder="e.g. IOSH Managing Safely" value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })} /></div>
                    <div><label className="input-label">Training Provider</label><input className="input-field" placeholder="e.g. CITB, St John Ambulance" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="input-label">Date Completed</label><input type="date" className="input-field" value={form.dateCompleted} onChange={(e) => setForm({ ...form, dateCompleted: e.target.value })} /></div>
                        <div><label className="input-label">Expiry Date</label><input type="date" className="input-field" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></div>
                    </div>
                    <div><label className="input-label">Certificate Reference</label><input className="input-field" placeholder="Certificate number" value={form.certificateRef} onChange={(e) => setForm({ ...form, certificateRef: e.target.value })} /></div>
                    <div><label className="input-label">Notes</label><textarea className="input-field" placeholder="Any additional notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                    <button onClick={handleSave} className="btn btn-primary btn-full mt-4">Save Record</button>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>Training Records</h1>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{items.length} record{items.length !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary"><Plus size={16} /> Add</button>
            </div>

            {/* Alerts */}
            {(expiredCount > 0 || expiringCount > 0) && (
                <div className="mb-4 space-y-2">
                    {expiredCount > 0 && (
                        <div className="card card-compact flex items-center gap-3" style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}>
                            <AlertCircle size={16} style={{ color: "var(--color-safety-red)", flexShrink: 0 }} />
                            <span className="text-sm font-medium" style={{ color: "var(--color-safety-red)" }}>{expiredCount} expired certificate{expiredCount !== 1 ? "s" : ""} — renewal required</span>
                        </div>
                    )}
                    {expiringCount > 0 && (
                        <div className="card card-compact flex items-center gap-3" style={{ borderColor: "rgba(234,179,8,0.3)", background: "rgba(234,179,8,0.05)" }}>
                            <AlertCircle size={16} style={{ color: "var(--color-safety-yellow)", flexShrink: 0 }} />
                            <span className="text-sm font-medium" style={{ color: "var(--color-safety-yellow)" }}>{expiringCount} certificate{expiringCount !== 1 ? "s" : ""} expiring within 30 days</span>
                        </div>
                    )}
                </div>
            )}

            {items.length === 0 ? (
                <div className="empty-state">
                    <GraduationCap size={40} style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>No training records</p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Track staff training, certificates, and expiry dates</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {items.map((item, i) => (
                        <div key={item.id} className="card card-compact stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(16,185,129,0.1)" }}>
                                    <GraduationCap size={16} style={{ color: "var(--color-safety-green)" }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{item.courseName}</p>
                                        <span className={`badge ${statusBadge(item.status).class}`}>{statusBadge(item.status).label}</span>
                                    </div>
                                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                        {item.employeeName}{item.expiryDate && ` · Exp: ${formatDate(item.expiryDate)}`}
                                    </p>
                                </div>
                                <button onClick={() => handleDelete(item.id)} className="btn btn-ghost" style={{ padding: "0.5rem", color: "var(--color-safety-red)" }}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
