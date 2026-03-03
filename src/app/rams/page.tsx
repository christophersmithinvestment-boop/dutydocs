"use client";

import { useState, useEffect } from "react";
import { Plus, FileText, ArrowLeft, Trash2, ChevronDown, ChevronUp, FileDown } from "lucide-react";
import { loadFromStore, saveToStore, generateId, calculateRiskLevel, getRiskBadgeClass, formatDate, type RiskLevel } from "@/lib/utils";
import { SafeGuardPDF, pdfDate } from "@/lib/pdf-generator";

interface RAMSStep {
    id: string;
    description: string;
    hazards: string;
    controls: string;
    responsiblePerson: string;
}

interface RAMS {
    id: string;
    taskTitle: string;
    projectName: string;
    location: string;
    assessor: string;
    taskDescription: string;
    steps: RAMSStep[];
    ppeRequired: string[];
    plantEquipment: string;
    overallLikelihood: number;
    overallSeverity: number;
    riskLevel: RiskLevel;
    emergencyProcedures: string;
    reviewDate: string;
    createdAt: string;
}

const STORE_KEY = "rams";

const PPE_LIST = [
    "Hard Hat", "Hi-Vis Vest", "Safety Boots", "Safety Goggles",
    "Gloves", "Ear Defenders", "Harness", "Respirator", "Face Shield",
];

export default function RAMSPage() {
    const [items, setItems] = useState<RAMS[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [steps, setSteps] = useState<RAMSStep[]>([
        { id: "1", description: "", hazards: "", controls: "", responsiblePerson: "" },
    ]);
    const [form, setForm] = useState({
        taskTitle: "", projectName: "", location: "", assessor: "",
        taskDescription: "", ppeRequired: [] as string[], plantEquipment: "",
        overallLikelihood: 3, overallSeverity: 3, emergencyProcedures: "", reviewDate: "",
    });

    useEffect(() => {
        setItems(loadFromStore<RAMS[]>(STORE_KEY, []));
    }, []);

    const togglePPE = (ppe: string) => {
        setForm({
            ...form,
            ppeRequired: form.ppeRequired.includes(ppe)
                ? form.ppeRequired.filter((p) => p !== ppe)
                : [...form.ppeRequired, ppe],
        });
    };

    const addStep = () => {
        setSteps([...steps, { id: generateId(), description: "", hazards: "", controls: "", responsiblePerson: "" }]);
    };

    const updateStep = (id: string, field: keyof RAMSStep, value: string) => {
        setSteps(steps.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    };

    const removeStep = (id: string) => {
        if (steps.length <= 1) return;
        setSteps(steps.filter((s) => s.id !== id));
    };

    const handleSave = () => {
        if (!form.taskTitle.trim()) return;
        const riskLevel = calculateRiskLevel(form.overallLikelihood, form.overallSeverity);
        const newItem: RAMS = { id: generateId(), ...form, steps, riskLevel, createdAt: new Date().toISOString() };
        const updated = [newItem, ...items];
        setItems(updated);
        saveToStore(STORE_KEY, updated);
        setShowForm(false);
        setSteps([{ id: "1", description: "", hazards: "", controls: "", responsiblePerson: "" }]);
        setForm({
            taskTitle: "", projectName: "", location: "", assessor: "",
            taskDescription: "", ppeRequired: [], plantEquipment: "",
            overallLikelihood: 3, overallSeverity: 3, emergencyProcedures: "", reviewDate: "",
        });
    };

    const handleDelete = (id: string) => {
        const updated = items.filter((i) => i.id !== id);
        setItems(updated);
        saveToStore(STORE_KEY, updated);
    };

    const handleExportPDF = (item: RAMS) => {
        const pdf = new SafeGuardPDF();
        pdf.addHeader("Risk Assessment & Method Statement", `Ref: ${item.id.split("-")[0]}`);
        pdf.addSection("Task Details");
        pdf.addKeyValue("Task Title", item.taskTitle);
        pdf.addKeyValue("Project Name", item.projectName);
        pdf.addKeyValue("Location", item.location);
        pdf.addKeyValue("Assessor", item.assessor);
        pdf.addKeyValue("Created", pdfDate(item.createdAt));
        pdf.addKeyValue("Review Date", pdfDate(item.reviewDate));
        pdf.addTextBlock("Task Description", item.taskDescription);
        pdf.addSection("Method Statement");
        pdf.addTable(
            ["Step", "Description", "Hazards", "Controls", "Responsible"],
            item.steps.map((s, i) => [String(i + 1), s.description, s.hazards, s.controls, s.responsiblePerson]),
            [12, 40, 40, 40, 38]
        );
        pdf.addSection("Overall Risk Rating");
        pdf.addKeyValue("Likelihood", item.overallLikelihood);
        pdf.addKeyValue("Severity", item.overallSeverity);
        pdf.addRiskBadge("Risk Level", item.riskLevel, item.overallLikelihood * item.overallSeverity);
        pdf.addSection("PPE & Equipment");
        pdf.addTagList("PPE Required", item.ppeRequired);
        pdf.addTextBlock("Plant & Equipment", item.plantEquipment);
        pdf.addSection("Emergency Procedures");
        pdf.addTextBlock("Procedures", item.emergencyProcedures);
        const slug = item.taskTitle.toLowerCase().replace(/\s+/g, "-").slice(0, 30);
        pdf.save(`rams-${slug}.pdf`);
    };

    if (showForm) {
        return (
            <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-2xl mx-auto">
                <button onClick={() => setShowForm(false)} className="btn btn-ghost mb-4" style={{ padding: "0.5rem 0" }}>
                    <ArrowLeft size={18} /> Back
                </button>
                <h1 className="text-xl font-bold mb-6" style={{ color: "var(--color-text-primary)" }}>
                    New RAMS
                </h1>

                <div className="space-y-4">
                    <div>
                        <label className="input-label">Task Title *</label>
                        <input className="input-field" placeholder="e.g. Scaffolding Erection" value={form.taskTitle} onChange={(e) => setForm({ ...form, taskTitle: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="input-label">Project Name</label>
                            <input className="input-field" placeholder="Project" value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} />
                        </div>
                        <div>
                            <label className="input-label">Location</label>
                            <input className="input-field" placeholder="Site location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Task Description</label>
                        <textarea className="input-field" placeholder="Describe the overall task/activity..." value={form.taskDescription} onChange={(e) => setForm({ ...form, taskDescription: e.target.value })} />
                    </div>

                    {/* Method Steps */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="input-label" style={{ margin: 0 }}>Method Statement Steps</label>
                            <button onClick={addStep} className="btn btn-ghost" style={{ padding: "0.25rem 0.5rem", fontSize: "12px" }}>
                                <Plus size={14} /> Add Step
                            </button>
                        </div>
                        <div className="space-y-3">
                            {steps.map((step, idx) => (
                                <div key={step.id} className="card" style={{ background: "var(--color-bg-secondary)" }}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold" style={{ color: "var(--color-safety-orange)" }}>Step {idx + 1}</span>
                                        {steps.length > 1 && (
                                            <button onClick={() => removeStep(step.id)} className="btn btn-ghost" style={{ padding: "0.25rem", color: "var(--color-safety-red)" }}>
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <input className="input-field" placeholder="Step description" value={step.description} onChange={(e) => updateStep(step.id, "description", e.target.value)} />
                                        <input className="input-field" placeholder="Associated hazards" value={step.hazards} onChange={(e) => updateStep(step.id, "hazards", e.target.value)} />
                                        <input className="input-field" placeholder="Control measures" value={step.controls} onChange={(e) => updateStep(step.id, "controls", e.target.value)} />
                                        <input className="input-field" placeholder="Responsible person" value={step.responsiblePerson} onChange={(e) => updateStep(step.id, "responsiblePerson", e.target.value)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PPE */}
                    <div>
                        <label className="input-label">PPE Required</label>
                        <div className="flex flex-wrap gap-2">
                            {PPE_LIST.map((ppe) => (
                                <button
                                    key={ppe}
                                    type="button"
                                    onClick={() => togglePPE(ppe)}
                                    className={`badge cursor-pointer transition-all ${form.ppeRequired.includes(ppe) ? "badge-blue" : ""}`}
                                    style={{
                                        background: form.ppeRequired.includes(ppe) ? undefined : "var(--color-bg-input)",
                                        color: form.ppeRequired.includes(ppe) ? undefined : "var(--color-text-secondary)",
                                        border: "1px solid var(--color-border)",
                                    }}
                                >
                                    {ppe}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="input-label">Plant & Equipment</label>
                        <textarea className="input-field" placeholder="List plant/equipment needed..." value={form.plantEquipment} onChange={(e) => setForm({ ...form, plantEquipment: e.target.value })} />
                    </div>

                    {/* Overall Risk */}
                    <div className="card" style={{ background: "var(--color-bg-secondary)" }}>
                        <p className="text-sm font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>Overall Risk Rating</p>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="input-label">Likelihood (1-5)</label>
                                <select className="input-field" value={form.overallLikelihood} onChange={(e) => setForm({ ...form, overallLikelihood: Number(e.target.value) })}>
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} - {["Very Unlikely", "Unlikely", "Possible", "Likely", "Very Likely"][n - 1]}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="input-label">Severity (1-5)</label>
                                <select className="input-field" value={form.overallSeverity} onChange={(e) => setForm({ ...form, overallSeverity: Number(e.target.value) })}>
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} - {["Negligible", "Minor", "Moderate", "Major", "Catastrophic"][n - 1]}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>Risk:</span>
                            <span className={`badge ${getRiskBadgeClass(calculateRiskLevel(form.overallLikelihood, form.overallSeverity))}`}>
                                {form.overallLikelihood * form.overallSeverity} — {calculateRiskLevel(form.overallLikelihood, form.overallSeverity).toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="input-label">Emergency Procedures</label>
                        <textarea className="input-field" placeholder="Emergency response plan..." value={form.emergencyProcedures} onChange={(e) => setForm({ ...form, emergencyProcedures: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="input-label">Assessor</label>
                            <input className="input-field" placeholder="Your name" value={form.assessor} onChange={(e) => setForm({ ...form, assessor: e.target.value })} />
                        </div>
                        <div>
                            <label className="input-label">Review Date</label>
                            <input type="date" className="input-field" value={form.reviewDate} onChange={(e) => setForm({ ...form, reviewDate: e.target.value })} />
                        </div>
                    </div>

                    <button onClick={handleSave} className="btn btn-primary btn-full mt-4">
                        Save RAMS
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>RAMS</h1>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{items.length} method statement{items.length !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    <Plus size={16} /> New
                </button>
            </div>

            {items.length === 0 ? (
                <div className="empty-state">
                    <FileText size={40} style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>No RAMS yet</p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Create a risk assessment &amp; method statement</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {items.map((item, i) => (
                        <div key={item.id} className="card card-compact stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(59,130,246,0.1)" }}>
                                    <FileText size={16} style={{ color: "var(--color-safety-blue)" }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{item.taskTitle}</p>
                                        <span className={`badge ${getRiskBadgeClass(item.riskLevel)}`}>
                                            {item.riskLevel.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                        {item.steps.length} step{item.steps.length !== 1 ? "s" : ""} · {formatDate(item.createdAt)}
                                    </p>
                                </div>
                                <button onClick={() => handleExportPDF(item)} className="btn btn-ghost" style={{ padding: "0.5rem", color: "var(--color-accent)" }} title="Export PDF">
                                    <FileDown size={16} />
                                </button>
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
