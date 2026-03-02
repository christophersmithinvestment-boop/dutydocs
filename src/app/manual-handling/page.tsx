"use client";

import { useState, useEffect } from "react";
import { Plus, Dumbbell, ArrowLeft, Trash2 } from "lucide-react";
import { loadFromStore, saveToStore, generateId, calculateRiskLevel, getRiskBadgeClass, formatDate, type RiskLevel } from "@/lib/utils";

interface ManualHandlingAssessment {
    id: string;
    taskDescription: string;
    location: string;
    assessor: string;
    loadWeight: string;
    loadDescription: string;
    frequency: string;
    distance: string;
    // TILE factors
    taskFactors: string;
    individualFactors: string;
    loadFactors: string;
    environmentFactors: string;
    likelihood: number;
    severity: number;
    riskLevel: RiskLevel;
    controlMeasures: string;
    residualLikelihood: number;
    residualSeverity: number;
    residualRiskLevel: RiskLevel;
    reviewDate: string;
    createdAt: string;
}

const STORE_KEY = "manual_handling";

export default function ManualHandlingPage() {
    const [items, setItems] = useState<ManualHandlingAssessment[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        taskDescription: "", location: "", assessor: "", loadWeight: "", loadDescription: "",
        frequency: "", distance: "", taskFactors: "", individualFactors: "", loadFactors: "",
        environmentFactors: "", likelihood: 3, severity: 3, controlMeasures: "",
        residualLikelihood: 1, residualSeverity: 1, reviewDate: "",
    });

    useEffect(() => { setItems(loadFromStore<ManualHandlingAssessment[]>(STORE_KEY, [])); }, []);

    const handleSave = () => {
        if (!form.taskDescription.trim()) return;
        const riskLevel = calculateRiskLevel(form.likelihood, form.severity);
        const residualRiskLevel = calculateRiskLevel(form.residualLikelihood, form.residualSeverity);
        const newItem: ManualHandlingAssessment = { id: generateId(), ...form, riskLevel, residualRiskLevel, createdAt: new Date().toISOString() };
        const updated = [newItem, ...items];
        setItems(updated);
        saveToStore(STORE_KEY, updated);
        setShowForm(false);
        setForm({ taskDescription: "", location: "", assessor: "", loadWeight: "", loadDescription: "", frequency: "", distance: "", taskFactors: "", individualFactors: "", loadFactors: "", environmentFactors: "", likelihood: 3, severity: 3, controlMeasures: "", residualLikelihood: 1, residualSeverity: 1, reviewDate: "" });
    };

    const handleDelete = (id: string) => { const updated = items.filter((i) => i.id !== id); setItems(updated); saveToStore(STORE_KEY, updated); };

    if (showForm) {
        return (
            <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-2xl mx-auto">
                <button onClick={() => setShowForm(false)} className="btn btn-ghost mb-4" style={{ padding: "0.5rem 0" }}><ArrowLeft size={18} /> Back</button>
                <h1 className="text-xl font-bold mb-6" style={{ color: "var(--color-text-primary)" }}>Manual Handling Assessment</h1>
                <div className="space-y-4">
                    <div><label className="input-label">Task Description *</label><textarea className="input-field" placeholder="Describe the manual handling task..." value={form.taskDescription} onChange={(e) => setForm({ ...form, taskDescription: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="input-label">Location</label><input className="input-field" placeholder="Where?" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                        <div><label className="input-label">Assessor</label><input className="input-field" placeholder="Your name" value={form.assessor} onChange={(e) => setForm({ ...form, assessor: e.target.value })} /></div>
                    </div>

                    {/* Load Details */}
                    <div className="card" style={{ background: "var(--color-bg-secondary)" }}>
                        <p className="text-sm font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>Load Details</p>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="input-label">Weight (kg)</label><input className="input-field" placeholder="e.g. 25kg" value={form.loadWeight} onChange={(e) => setForm({ ...form, loadWeight: e.target.value })} /></div>
                                <div><label className="input-label">Frequency</label><input className="input-field" placeholder="e.g. 10x per shift" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} /></div>
                            </div>
                            <div><label className="input-label">Load Description</label><input className="input-field" placeholder="e.g. Boxes of stock, irregular shape" value={form.loadDescription} onChange={(e) => setForm({ ...form, loadDescription: e.target.value })} /></div>
                            <div><label className="input-label">Carry Distance</label><input className="input-field" placeholder="e.g. 20 metres" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} /></div>
                        </div>
                    </div>

                    {/* TILE Assessment */}
                    <div className="card" style={{ background: "var(--color-bg-secondary)" }}>
                        <p className="text-sm font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>TILE Assessment</p>
                        <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>Task, Individual, Load, Environment factors</p>
                        <div className="space-y-3">
                            <div><label className="input-label">Task Factors</label><textarea className="input-field" placeholder="Twisting, stooping, reaching, repetition..." style={{ minHeight: "70px" }} value={form.taskFactors} onChange={(e) => setForm({ ...form, taskFactors: e.target.value })} /></div>
                            <div><label className="input-label">Individual Factors</label><textarea className="input-field" placeholder="Fitness, training, pregnancy, disability..." style={{ minHeight: "70px" }} value={form.individualFactors} onChange={(e) => setForm({ ...form, individualFactors: e.target.value })} /></div>
                            <div><label className="input-label">Load Factors</label><textarea className="input-field" placeholder="Heavy, bulky, difficult to grip, unstable..." style={{ minHeight: "70px" }} value={form.loadFactors} onChange={(e) => setForm({ ...form, loadFactors: e.target.value })} /></div>
                            <div><label className="input-label">Environment Factors</label><textarea className="input-field" placeholder="Space, floor surface, temperature, lighting..." style={{ minHeight: "70px" }} value={form.environmentFactors} onChange={(e) => setForm({ ...form, environmentFactors: e.target.value })} /></div>
                        </div>
                    </div>

                    {/* Risk Rating */}
                    <div className="card" style={{ background: "var(--color-bg-secondary)" }}>
                        <p className="text-sm font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>Risk Rating</p>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div><label className="input-label">Likelihood (1-5)</label>
                                <select className="input-field" value={form.likelihood} onChange={(e) => setForm({ ...form, likelihood: Number(e.target.value) })}>
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} - {["Very Unlikely", "Unlikely", "Possible", "Likely", "Very Likely"][n - 1]}</option>)}
                                </select></div>
                            <div><label className="input-label">Severity (1-5)</label>
                                <select className="input-field" value={form.severity} onChange={(e) => setForm({ ...form, severity: Number(e.target.value) })}>
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} - {["Negligible", "Minor", "Moderate", "Major", "Catastrophic"][n - 1]}</option>)}
                                </select></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>Risk:</span>
                            <span className={`badge ${getRiskBadgeClass(calculateRiskLevel(form.likelihood, form.severity))}`}>{form.likelihood * form.severity} — {calculateRiskLevel(form.likelihood, form.severity).toUpperCase()}</span>
                        </div>
                    </div>

                    <div><label className="input-label">Control Measures</label><textarea className="input-field" placeholder="Mechanical aids, training, team lifting, reduce weight..." value={form.controlMeasures} onChange={(e) => setForm({ ...form, controlMeasures: e.target.value })} /></div>

                    {/* Residual Risk */}
                    <div className="card" style={{ background: "var(--color-bg-secondary)" }}>
                        <p className="text-sm font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>Residual Risk (After Controls)</p>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div><label className="input-label">Likelihood (1-5)</label>
                                <select className="input-field" value={form.residualLikelihood} onChange={(e) => setForm({ ...form, residualLikelihood: Number(e.target.value) })}>
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                </select></div>
                            <div><label className="input-label">Severity (1-5)</label>
                                <select className="input-field" value={form.residualSeverity} onChange={(e) => setForm({ ...form, residualSeverity: Number(e.target.value) })}>
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                </select></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>Residual Risk:</span>
                            <span className={`badge ${getRiskBadgeClass(calculateRiskLevel(form.residualLikelihood, form.residualSeverity))}`}>{form.residualLikelihood * form.residualSeverity} — {calculateRiskLevel(form.residualLikelihood, form.residualSeverity).toUpperCase()}</span>
                        </div>
                    </div>

                    <div><label className="input-label">Review Date</label><input type="date" className="input-field" value={form.reviewDate} onChange={(e) => setForm({ ...form, reviewDate: e.target.value })} /></div>
                    <button onClick={handleSave} className="btn btn-primary btn-full mt-4">Save Assessment</button>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>Manual Handling</h1>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{items.length} assessment{items.length !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary"><Plus size={16} /> New</button>
            </div>
            {items.length === 0 ? (
                <div className="empty-state">
                    <Dumbbell size={40} style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>No manual handling assessments</p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Assess lifting, carrying, and handling tasks</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {items.map((item, i) => (
                        <div key={item.id} className="card card-compact stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{item.taskDescription}</p>
                                        <span className={`badge ${getRiskBadgeClass(item.riskLevel)}`}>{item.riskLevel.toUpperCase()}</span>
                                    </div>
                                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{item.loadWeight && `${item.loadWeight} · `}{item.location && `${item.location} · `}{formatDate(item.createdAt)}</p>
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
