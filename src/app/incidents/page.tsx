"use client";

import { useState, useEffect } from "react";
import { Plus, AlertTriangle, ArrowLeft, Trash2 } from "lucide-react";
import { loadFromStore, saveToStore, generateId, formatDate } from "@/lib/utils";

interface Incident {
    id: string;
    dateTime: string;
    location: string;
    description: string;
    injuryType: string;
    injuredPerson: string;
    firstAidGiven: boolean;
    firstAidDetails: string;
    witnesses: string;
    riddorReportable: boolean;
    immediateActions: string;
    rootCause: string;
    correctiveActions: string;
    reportedBy: string;
    severity: "minor" | "moderate" | "major" | "serious";
    createdAt: string;
}

const STORE_KEY = "incidents";

const INJURY_TYPES = [
    "Cut/Laceration", "Fracture", "Burn", "Sprain/Strain",
    "Crush Injury", "Electric Shock", "Chemical Exposure",
    "Fall from Height", "Slip/Trip", "Near Drowning", "Other",
];

export default function IncidentsPage() {
    const [items, setItems] = useState<Incident[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        dateTime: "", location: "", description: "", injuryType: "",
        injuredPerson: "", firstAidGiven: false, firstAidDetails: "",
        witnesses: "", riddorReportable: false, immediateActions: "",
        rootCause: "", correctiveActions: "", reportedBy: "",
        severity: "minor" as Incident["severity"],
    });

    useEffect(() => {
        setItems(loadFromStore<Incident[]>(STORE_KEY, []));
    }, []);

    const handleSave = () => {
        if (!form.description.trim()) return;
        const newItem: Incident = { id: generateId(), ...form, createdAt: new Date().toISOString() };
        const updated = [newItem, ...items];
        setItems(updated);
        saveToStore(STORE_KEY, updated);
        setShowForm(false);
        setForm({
            dateTime: "", location: "", description: "", injuryType: "",
            injuredPerson: "", firstAidGiven: false, firstAidDetails: "",
            witnesses: "", riddorReportable: false, immediateActions: "",
            rootCause: "", correctiveActions: "", reportedBy: "",
            severity: "minor",
        });
    };

    const handleDelete = (id: string) => {
        const updated = items.filter((i) => i.id !== id);
        setItems(updated);
        saveToStore(STORE_KEY, updated);
    };

    const severityBadge = (s: string) => {
        switch (s) {
            case "minor": return "badge-green";
            case "moderate": return "badge-yellow";
            case "major": return "badge-orange";
            case "serious": return "badge-red";
            default: return "badge-blue";
        }
    };

    if (showForm) {
        return (
            <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-2xl mx-auto">
                <button onClick={() => setShowForm(false)} className="btn btn-ghost mb-4" style={{ padding: "0.5rem 0" }}>
                    <ArrowLeft size={18} /> Back
                </button>
                <h1 className="text-xl font-bold mb-6" style={{ color: "var(--color-text-primary)" }}>
                    Report Incident
                </h1>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="input-label">Date & Time *</label>
                            <input type="datetime-local" className="input-field" value={form.dateTime} onChange={(e) => setForm({ ...form, dateTime: e.target.value })} />
                        </div>
                        <div>
                            <label className="input-label">Location</label>
                            <input className="input-field" placeholder="Where it happened" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="input-label">Incident Description *</label>
                        <textarea className="input-field" placeholder="Describe what happened..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </div>

                    <div>
                        <label className="input-label">Severity</label>
                        <select className="input-field" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as Incident["severity"] })}>
                            <option value="minor">Minor — First aid only</option>
                            <option value="moderate">Moderate — Medical treatment</option>
                            <option value="major">Major — Lost time injury</option>
                            <option value="serious">Serious — Hospitalisation/fatality</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="input-label">Injury Type</label>
                            <select className="input-field" value={form.injuryType} onChange={(e) => setForm({ ...form, injuryType: e.target.value })}>
                                <option value="">Select type...</option>
                                {INJURY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Injured Person</label>
                            <input className="input-field" placeholder="Name of person" value={form.injuredPerson} onChange={(e) => setForm({ ...form, injuredPerson: e.target.value })} />
                        </div>
                    </div>

                    {/* First Aid Toggle */}
                    <div className="card card-compact flex items-center justify-between" style={{ background: "var(--color-bg-secondary)" }}>
                        <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>First Aid Given?</span>
                        <div
                            className={`toggle ${form.firstAidGiven ? "active" : ""}`}
                            onClick={() => setForm({ ...form, firstAidGiven: !form.firstAidGiven })}
                        />
                    </div>
                    {form.firstAidGiven && (
                        <div>
                            <label className="input-label">First Aid Details</label>
                            <textarea className="input-field" placeholder="What first aid was administered?" value={form.firstAidDetails} onChange={(e) => setForm({ ...form, firstAidDetails: e.target.value })} />
                        </div>
                    )}

                    <div>
                        <label className="input-label">Witnesses</label>
                        <input className="input-field" placeholder="Names of any witnesses" value={form.witnesses} onChange={(e) => setForm({ ...form, witnesses: e.target.value })} />
                    </div>

                    {/* RIDDOR Toggle */}
                    <div className="card card-compact flex items-center justify-between" style={{ background: "var(--color-bg-secondary)" }}>
                        <div>
                            <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>RIDDOR Reportable?</span>
                            <p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>Reporting of Injuries, Diseases and Dangerous Occurrences</p>
                        </div>
                        <div
                            className={`toggle ${form.riddorReportable ? "active" : ""}`}
                            onClick={() => setForm({ ...form, riddorReportable: !form.riddorReportable })}
                        />
                    </div>

                    <div>
                        <label className="input-label">Immediate Actions Taken</label>
                        <textarea className="input-field" placeholder="What immediate actions were taken?" value={form.immediateActions} onChange={(e) => setForm({ ...form, immediateActions: e.target.value })} />
                    </div>
                    <div>
                        <label className="input-label">Root Cause</label>
                        <textarea className="input-field" placeholder="What was the root cause?" value={form.rootCause} onChange={(e) => setForm({ ...form, rootCause: e.target.value })} />
                    </div>
                    <div>
                        <label className="input-label">Corrective Actions</label>
                        <textarea className="input-field" placeholder="Actions to prevent recurrence..." value={form.correctiveActions} onChange={(e) => setForm({ ...form, correctiveActions: e.target.value })} />
                    </div>
                    <div>
                        <label className="input-label">Reported By</label>
                        <input className="input-field" placeholder="Your name" value={form.reportedBy} onChange={(e) => setForm({ ...form, reportedBy: e.target.value })} />
                    </div>

                    <button onClick={handleSave} className="btn btn-primary btn-full mt-4">
                        Submit Incident Report
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>Incident Reports</h1>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{items.length} report{items.length !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    <Plus size={16} /> Report
                </button>
            </div>

            {items.length === 0 ? (
                <div className="empty-state">
                    <AlertTriangle size={40} style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>No incidents reported</p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Tap &quot;Report&quot; to log a workplace incident</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {items.map((item, i) => (
                        <div key={item.id} className="card card-compact stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(239,68,68,0.1)" }}>
                                    <AlertTriangle size={16} style={{ color: "var(--color-safety-red)" }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{item.description}</p>
                                        <span className={`badge ${severityBadge(item.severity)}`}>{item.severity.toUpperCase()}</span>
                                    </div>
                                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                        {item.location && `${item.location} · `}{formatDate(item.createdAt)}
                                        {item.riddorReportable && " · RIDDOR"}
                                    </p>
                                </div>
                                <button onClick={() => handleDelete(item.id)} className="btn btn-ghost" style={{ padding: "0.5rem", color: "var(--color-safety-red)" }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
