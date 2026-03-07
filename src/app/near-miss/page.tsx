"use client";

import { useState } from "react";
import { Plus, TriangleAlert, ArrowLeft, Trash2, FileDown } from "lucide-react";
import { generateId, formatDate } from "@/lib/utils";
import { DutyDocsPDF, pdfDateTime } from "@/lib/pdf-generator";
import { useModuleData } from "@/hooks/useModuleData";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradeModal from "@/components/UpgradeModal";
import { RecordSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { ModuleToolbar } from "@/components/ModuleToolbar";

interface NearMiss {
    id: string;
    description: string;
    location: string;
    dateTime: string;
    potentialSeverity: "low" | "medium" | "high" | "critical";
    suggestedAction: string;
    reportedBy: string;
    category: string;
    createdAt: string;
}

const CATEGORIES = [
    "Slip/Trip Hazard", "Falling Object", "Electrical", "Chemical Spill",
    "Vehicle/Plant", "Working at Height", "Manual Handling", "Fire Risk",
    "Housekeeping", "PPE Issue", "Environmental", "Other",
];

export default function NearMissPage() {
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
    } = useModuleData<NearMiss & { title: string }>({
        module: "near_misses",
        storeKey: "near_misses"
    });
    const { isLimitReached } = useSubscription();
    const { showToast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [form, setForm] = useState({
        description: "", location: "", dateTime: "",
        potentialSeverity: "medium" as NearMiss["potentialSeverity"],
        suggestedAction: "", reportedBy: "", category: "",
    });

    const handleSave = () => {
        if (!form.description.trim()) return;

        if (isLimitReached(totalRecords)) {
            setShowUpgradeModal(true);
            return;
        }

        const newItem: NearMiss & { title: string } = {
            id: generateId(),
            ...form,
            title: form.description,
            createdAt: new Date().toISOString()
        };
        addItem(newItem);
        showToast("Near miss reported successfully");
        setShowForm(false);
        setForm({ description: "", location: "", dateTime: "", potentialSeverity: "medium", suggestedAction: "", reportedBy: "", category: "" });
    };

    const handleDelete = (id: string) => {
        removeItem(id);
        showToast("Report deleted", "info");
    };

    const handleExportPDF = (item: NearMiss) => {
        const pdf = new DutyDocsPDF();
        pdf.addHeader("Near Miss Report", `Ref: ${item.id.split("-")[0]}`);
        pdf.addSection("Near Miss Details");
        pdf.addKeyValue("Date & Time", pdfDateTime(item.dateTime));
        pdf.addKeyValue("Location", item.location);
        pdf.addKeyValue("Category", item.category);
        pdf.addRiskBadge("Potential Severity", item.potentialSeverity);
        pdf.addKeyValue("Reported By", item.reportedBy);
        pdf.addSection("Description");
        pdf.addTextBlock("What Happened", item.description);
        pdf.addSection("Recommended Action");
        pdf.addTextBlock("Suggested Action", item.suggestedAction);
        pdf.save(`near-miss-${item.id.split("-")[0]}.pdf`);
    };

    const severityBadge = (s: string) => {
        switch (s) {
            case "low": return "badge-green";
            case "medium": return "badge-yellow";
            case "high": return "badge-orange";
            case "critical": return "badge-red";
            default: return "badge-blue";
        }
    };

    if (showForm) {
        return (
            <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-2xl mx-auto">
                <button onClick={() => setShowForm(false)} className="btn btn-ghost mb-4" style={{ padding: "0.5rem 0" }}>
                    <ArrowLeft size={18} /> Back
                </button>
                <h1 className="text-xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
                    Report Near Miss
                </h1>
                <p className="text-xs mb-6" style={{ color: "var(--color-text-muted)" }}>
                    Quick capture — report what almost happened
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="input-label">What happened? *</label>
                        <textarea className="input-field" placeholder="Describe the near miss event..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </div>

                    <div>
                        <label className="input-label">Category</label>
                        <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                            <option value="">Select category...</option>
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="input-label">Location</label>
                            <input className="input-field" placeholder="Where?" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                        </div>
                        <div>
                            <label className="input-label">Date & Time</label>
                            <input type="datetime-local" className="input-field" value={form.dateTime} onChange={(e) => setForm({ ...form, dateTime: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="input-label">Potential Severity</label>
                        <select className="input-field" value={form.potentialSeverity} onChange={(e) => setForm({ ...form, potentialSeverity: e.target.value as NearMiss["potentialSeverity"] })}>
                            <option value="low">Low — Minor injury possible</option>
                            <option value="medium">Medium — Moderate injury possible</option>
                            <option value="high">High — Serious injury possible</option>
                            <option value="critical">Critical — Fatality possible</option>
                        </select>
                    </div>

                    <div>
                        <label className="input-label">Suggested Action</label>
                        <textarea className="input-field" placeholder="What should be done to prevent this?" value={form.suggestedAction} onChange={(e) => setForm({ ...form, suggestedAction: e.target.value })} />
                    </div>

                    <div>
                        <label className="input-label">Reported By</label>
                        <input className="input-field" placeholder="Your name" value={form.reportedBy} onChange={(e) => setForm({ ...form, reportedBy: e.target.value })} />
                    </div>

                    <button onClick={handleSave} className="btn btn-primary btn-full mt-4">
                        Submit Near Miss
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>Near Misses</h1>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{totalRecords} report{totalRecords !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    <Plus size={16} /> Report
                </button>
            </div>

            <ModuleToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                placeholder="Search descriptions..."
                onExport={exportData}
                onImport={async (file) => {
                    try {
                        await importData(file);
                        showToast("Reports imported successfully");
                    } catch {
                        showToast("Failed to import reports", "error");
                    }
                }}
            />

            {loading ? (
                <RecordSkeleton count={3} />
            ) : filteredItems.length === 0 ? (
                <div className="empty-state">
                    <TriangleAlert size={40} style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
                        {searchTerm || statusFilter !== "all" ? "No matching reports" : "No near misses reported"}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                        {searchTerm || statusFilter !== "all" ? "Try adjusting your filters" : "Quickly capture close calls to improve safety"}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredItems.map((item, i) => (
                        <div key={item.id} className="card card-compact stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(234,179,8,0.1)" }}>
                                    <TriangleAlert size={16} style={{ color: "var(--color-safety-yellow)" }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{item.description}</p>
                                        <span className={`badge ${severityBadge(item.potentialSeverity)}`}>{item.potentialSeverity.toUpperCase()}</span>
                                    </div>
                                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                        {item.category && `${item.category} · `}{item.location && `${item.location} · `}{formatDate(item.createdAt)}
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
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                title="Record Limit Reached"
                description={`You've reached the 50 record limit on the Starter plan. Upgrade to Pro to create unlimited health and safety documents.`}
            />
        </div>
    );
}
