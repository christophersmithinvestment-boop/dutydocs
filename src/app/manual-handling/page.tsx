"use client";

import { useState } from "react";
import { Plus, Dumbbell, ArrowLeft, Trash2, FileDown } from "lucide-react";
import { generateId, calculateRiskLevel, getRiskBadgeClass, formatDate, type RiskLevel } from "@/lib/utils";
import { DutyDocsPDF, pdfDate } from "@/lib/pdf-generator";
import { useModuleData } from "@/hooks/useModuleData";
import PremiumModuleGuard from "@/components/PremiumModuleGuard";
import { RecordSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { ModuleToolbar } from "@/components/ModuleToolbar";

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

export default function ManualHandlingPage() {
    const {
        items,
        filteredItems,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        loading,
        totalRecords,
        addItem,
        removeItem,
        exportData,
        importData
    } = useModuleData<ManualHandlingAssessment & { title: string }>({
        module: "manual_handling",
        storeKey: "manual_handling"
    });
    const { showToast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        taskDescription: "", location: "", assessor: "", loadWeight: "", loadDescription: "",
        frequency: "", distance: "", taskFactors: "", individualFactors: "", loadFactors: "",
        environmentFactors: "", likelihood: 3, severity: 3, controlMeasures: "",
        residualLikelihood: 1, residualSeverity: 1, reviewDate: "",
    });

    const handleSave = () => {
        if (!form.taskDescription.trim()) return;
        const riskLevel = calculateRiskLevel(form.likelihood, form.severity);
        const residualRiskLevel = calculateRiskLevel(form.residualLikelihood, form.residualSeverity);
        const newItem: ManualHandlingAssessment & { title: string } = {
            id: generateId(),
            ...form,
            title: form.taskDescription,
            riskLevel,
            residualRiskLevel,
            createdAt: new Date().toISOString()
        };
        addItem(newItem);
        showToast("Assessment saved successfully");
        setShowForm(false);
        setForm({ taskDescription: "", location: "", assessor: "", loadWeight: "", loadDescription: "", frequency: "", distance: "", taskFactors: "", individualFactors: "", loadFactors: "", environmentFactors: "", likelihood: 3, severity: 3, controlMeasures: "", residualLikelihood: 1, residualSeverity: 1, reviewDate: "" });
    };

    const handleDelete = (id: string) => {
        removeItem(id);
        showToast("Assessment deleted", "info");
    };

    const handleExportPDF = (item: ManualHandlingAssessment) => {
        const pdf = new DutyDocsPDF();
        pdf.addHeader("Manual Handling Assessment", `Ref: ${item.id.split("-")[0]}`);
        pdf.addSection("Task Details");
        pdf.addKeyValue("Task Description", item.taskDescription);
        pdf.addKeyValue("Location", item.location);
        pdf.addKeyValue("Assessor", item.assessor);
        pdf.addKeyValue("Created", pdfDate(item.createdAt));
        pdf.addKeyValue("Review Date", pdfDate(item.reviewDate));
        pdf.addSection("Load Details");
        pdf.addKeyValue("Load Weight", item.loadWeight);
        pdf.addKeyValue("Load Description", item.loadDescription);
        pdf.addKeyValue("Frequency", item.frequency);
        pdf.addKeyValue("Distance", item.distance);
        pdf.addSection("TILE Assessment");
        pdf.addTextBlock("Task Factors", item.taskFactors);
        pdf.addTextBlock("Individual Factors", item.individualFactors);
        pdf.addTextBlock("Load Factors", item.loadFactors);
        pdf.addTextBlock("Environment Factors", item.environmentFactors);
        pdf.addSection("Initial Risk Rating");
        pdf.addKeyValue("Likelihood", item.likelihood);
        pdf.addKeyValue("Severity", item.severity);
        pdf.addRiskBadge("Risk Level", item.riskLevel, item.likelihood * item.severity);
        pdf.addSection("Control Measures");
        pdf.addTextBlock("Controls", item.controlMeasures);
        pdf.addSection("Residual Risk");
        pdf.addKeyValue("Residual Likelihood", item.residualLikelihood);
        pdf.addKeyValue("Residual Severity", item.residualSeverity);
        pdf.addRiskBadge("Residual Risk", item.residualRiskLevel, item.residualLikelihood * item.residualSeverity);
        const slug = item.taskDescription.toLowerCase().replace(/\s+/g, "-").slice(0, 30);
        pdf.save(`manual-handling-${slug}.pdf`);
    };

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
        <PremiumModuleGuard moduleName="Manual Handling">
            <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>Manual Handling</h1>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{totalRecords} assessment{totalRecords !== 1 ? "s" : ""}</p>
                    </div>
                    <button onClick={() => setShowForm(true)} className="btn btn-primary"><Plus size={16} /> New</button>
                </div>

                <ModuleToolbar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    placeholder="Search tasks..."
                    onExport={exportData}
                    onImport={async (file) => {
                        try {
                            await importData(file);
                            showToast("Assessments imported successfully");
                        } catch {
                            showToast("Failed to import assessments", "error");
                        }
                    }}
                />

                {loading ? (
                    <RecordSkeleton count={3} />
                ) : filteredItems.length === 0 ? (
                    <div className="empty-state">
                        <Dumbbell size={40} style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }} />
                        <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
                            {searchTerm || statusFilter !== "all" ? "No matching assessments" : "No manual handling assessments"}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                            {searchTerm || statusFilter !== "all" ? "Try adjusting your filters" : "Assess lifting, carrying, and handling tasks"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredItems.map((item, i) => (
                            <div key={item.id} className="card card-compact stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(59,130,246,0.1)" }}>
                                        <Dumbbell size={16} style={{ color: "var(--color-safety-blue)" }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{item.taskDescription}</p>
                                            <span className={`badge ${getRiskBadgeClass(item.riskLevel)}`}>{item.riskLevel.toUpperCase()}</span>
                                        </div>
                                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{item.loadWeight && `${item.loadWeight} · `}{item.location && `${item.location} · `}{formatDate(item.createdAt)}</p>
                                    </div>
                                    <button onClick={() => handleExportPDF(item)} className="btn btn-ghost" style={{ padding: "0.5rem", color: "var(--color-accent)" }} title="Export PDF"><FileDown size={16} /></button>
                                    <button onClick={() => handleDelete(item.id)} className="btn btn-ghost" style={{ padding: "0.5rem", color: "var(--color-safety-red)" }}><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PremiumModuleGuard>
    );
}
