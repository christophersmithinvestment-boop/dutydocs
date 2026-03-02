"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    ClipboardCheck,
    ChevronRight,
    ArrowLeft,
    Trash2,
} from "lucide-react";
import {
    loadFromStore,
    saveToStore,
    generateId,
    calculateRiskLevel,
    getRiskBadgeClass,
    formatDate,
    type RiskLevel,
} from "@/lib/utils";

interface RiskAssessment {
    id: string;
    title: string;
    location: string;
    assessor: string;
    hazardDescription: string;
    whoAtRisk: string;
    likelihood: number;
    severity: number;
    riskLevel: RiskLevel;
    controlMeasures: string;
    residualLikelihood: number;
    residualSeverity: number;
    residualRiskLevel: RiskLevel;
    responsiblePerson: string;
    reviewDate: string;
    createdAt: string;
    status: "draft" | "active" | "closed";
}

const STORE_KEY = "risk_assessments";

export default function RiskAssessmentPage() {
    const [items, setItems] = useState<RiskAssessment[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        title: "",
        location: "",
        assessor: "",
        hazardDescription: "",
        whoAtRisk: "",
        likelihood: 3,
        severity: 3,
        controlMeasures: "",
        residualLikelihood: 1,
        residualSeverity: 1,
        responsiblePerson: "",
        reviewDate: "",
    });

    useEffect(() => {
        setItems(loadFromStore<RiskAssessment[]>(STORE_KEY, []));
    }, []);

    const handleSave = () => {
        if (!form.title.trim()) return;
        const riskLevel = calculateRiskLevel(form.likelihood, form.severity);
        const residualRiskLevel = calculateRiskLevel(form.residualLikelihood, form.residualSeverity);
        const newItem: RiskAssessment = {
            id: generateId(),
            ...form,
            riskLevel,
            residualRiskLevel,
            createdAt: new Date().toISOString(),
            status: "active",
        };
        const updated = [newItem, ...items];
        setItems(updated);
        saveToStore(STORE_KEY, updated);
        setShowForm(false);
        setForm({
            title: "", location: "", assessor: "", hazardDescription: "",
            whoAtRisk: "", likelihood: 3, severity: 3, controlMeasures: "",
            residualLikelihood: 1, residualSeverity: 1, responsiblePerson: "", reviewDate: "",
        });
    };

    const handleDelete = (id: string) => {
        const updated = items.filter((i) => i.id !== id);
        setItems(updated);
        saveToStore(STORE_KEY, updated);
    };

    if (showForm) {
        return (
            <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-2xl mx-auto">
                <button onClick={() => setShowForm(false)} className="btn btn-ghost mb-4" style={{ padding: "0.5rem 0" }}>
                    <ArrowLeft size={18} /> Back
                </button>
                <h1 className="text-xl font-bold mb-6" style={{ color: "var(--color-text-primary)" }}>
                    New Risk Assessment
                </h1>

                <div className="space-y-4">
                    <div>
                        <label className="input-label">Assessment Title *</label>
                        <input className="input-field" placeholder="e.g. Workshop Manual Handling" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="input-label">Location</label>
                            <input className="input-field" placeholder="e.g. Warehouse B" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                        </div>
                        <div>
                            <label className="input-label">Assessor</label>
                            <input className="input-field" placeholder="Your name" value={form.assessor} onChange={(e) => setForm({ ...form, assessor: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Hazard Description *</label>
                        <textarea className="input-field" placeholder="Describe the hazard identified..." value={form.hazardDescription} onChange={(e) => setForm({ ...form, hazardDescription: e.target.value })} />
                    </div>
                    <div>
                        <label className="input-label">Who is at Risk?</label>
                        <input className="input-field" placeholder="e.g. Warehouse staff, visitors" value={form.whoAtRisk} onChange={(e) => setForm({ ...form, whoAtRisk: e.target.value })} />
                    </div>

                    {/* Risk Matrix */}
                    <div className="card" style={{ background: "var(--color-bg-secondary)" }}>
                        <p className="text-sm font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>Initial Risk Rating</p>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="input-label">Likelihood (1-5)</label>
                                <select className="input-field" value={form.likelihood} onChange={(e) => setForm({ ...form, likelihood: Number(e.target.value) })}>
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} - {["Very Unlikely", "Unlikely", "Possible", "Likely", "Very Likely"][n - 1]}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="input-label">Severity (1-5)</label>
                                <select className="input-field" value={form.severity} onChange={(e) => setForm({ ...form, severity: Number(e.target.value) })}>
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} - {["Negligible", "Minor", "Moderate", "Major", "Catastrophic"][n - 1]}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>Risk Score:</span>
                            <span className={`badge ${getRiskBadgeClass(calculateRiskLevel(form.likelihood, form.severity))}`}>
                                {form.likelihood * form.severity} — {calculateRiskLevel(form.likelihood, form.severity).toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="input-label">Control Measures *</label>
                        <textarea className="input-field" placeholder="What controls will be put in place to reduce the risk?" value={form.controlMeasures} onChange={(e) => setForm({ ...form, controlMeasures: e.target.value })} />
                    </div>

                    {/* Residual Risk */}
                    <div className="card" style={{ background: "var(--color-bg-secondary)" }}>
                        <p className="text-sm font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>Residual Risk (After Controls)</p>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="input-label">Likelihood (1-5)</label>
                                <select className="input-field" value={form.residualLikelihood} onChange={(e) => setForm({ ...form, residualLikelihood: Number(e.target.value) })}>
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} - {["Very Unlikely", "Unlikely", "Possible", "Likely", "Very Likely"][n - 1]}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="input-label">Severity (1-5)</label>
                                <select className="input-field" value={form.residualSeverity} onChange={(e) => setForm({ ...form, residualSeverity: Number(e.target.value) })}>
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} - {["Negligible", "Minor", "Moderate", "Major", "Catastrophic"][n - 1]}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>Residual Risk:</span>
                            <span className={`badge ${getRiskBadgeClass(calculateRiskLevel(form.residualLikelihood, form.residualSeverity))}`}>
                                {form.residualLikelihood * form.residualSeverity} — {calculateRiskLevel(form.residualLikelihood, form.residualSeverity).toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="input-label">Responsible Person</label>
                            <input className="input-field" placeholder="Person responsible" value={form.responsiblePerson} onChange={(e) => setForm({ ...form, responsiblePerson: e.target.value })} />
                        </div>
                        <div>
                            <label className="input-label">Review Date</label>
                            <input type="date" className="input-field" value={form.reviewDate} onChange={(e) => setForm({ ...form, reviewDate: e.target.value })} />
                        </div>
                    </div>

                    <button onClick={handleSave} className="btn btn-primary btn-full mt-4">
                        Save Risk Assessment
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>Risk Assessments</h1>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{items.length} assessment{items.length !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    <Plus size={16} /> New
                </button>
            </div>

            {items.length === 0 ? (
                <div className="empty-state">
                    <ClipboardCheck size={40} style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>No risk assessments yet</p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Tap &quot;New&quot; to create your first assessment</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {items.map((item, i) => (
                        <div key={item.id} className="card card-compact stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{item.title}</p>
                                        <span className={`badge ${getRiskBadgeClass(item.riskLevel)}`}>
                                            {item.riskLevel.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                        {item.location && `${item.location} · `}{formatDate(item.createdAt)}
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
