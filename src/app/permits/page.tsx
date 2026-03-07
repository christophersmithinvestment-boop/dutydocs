"use client";

import { useState } from "react";
import { Plus, ShieldCheck, ArrowLeft, Trash2, FileDown } from "lucide-react";
import { generateId, formatDate } from "@/lib/utils";
import { DutyDocsPDF, pdfDate } from "@/lib/pdf-generator";
import { useModuleData } from "@/hooks/useModuleData";
import PremiumModuleGuard from "@/components/PremiumModuleGuard";
import { RecordSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { ModuleToolbar } from "@/components/ModuleToolbar";

interface Permit {
    id: string;
    permitType: string;
    description: string;
    location: string;
    requestedBy: string;
    startDate: string;
    endDate: string;
    precautions: string;
    isolationRequired: boolean;
    gasTestRequired: boolean;
    rescuePlanInPlace: boolean;
    authorisedBy: string;
    status: "draft" | "pending" | "active" | "closed";
    createdAt: string;
}

const PERMIT_TYPES = [
    "Hot Work",
    "Confined Space Entry",
    "Excavation",
    "Electrical Isolation",
    "Working at Height",
    "Roof Access",
    "Chemical Handling",
];

export default function PermitsPage() {
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
        editItem,
        exportData,
        importData
    } = useModuleData<Permit & { title: string }>({
        module: "permits",
        storeKey: "permits"
    });
    const { showToast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        permitType: "", description: "", location: "", requestedBy: "",
        startDate: "", endDate: "", precautions: "",
        isolationRequired: false, gasTestRequired: false, rescuePlanInPlace: false,
        authorisedBy: "", status: "draft" as Permit["status"],
    });

    const handleSave = () => {
        if (!form.permitType || !form.description.trim()) return;
        const newItem: Permit & { title: string } = {
            id: generateId(),
            ...form,
            title: form.permitType,
            createdAt: new Date().toISOString()
        };
        addItem(newItem);
        showToast("Permit created successfully");
        setShowForm(false);
        setForm({
            permitType: "", description: "", location: "", requestedBy: "",
            startDate: "", endDate: "", precautions: "",
            isolationRequired: false, gasTestRequired: false, rescuePlanInPlace: false,
            authorisedBy: "", status: "draft",
        });
    };

    const handleDelete = (id: string) => {
        removeItem(id);
        showToast("Permit deleted", "info");
    };

    const handleExportPDF = (item: Permit) => {
        const pdf = new DutyDocsPDF();
        pdf.addHeader("Permit to Work", `Ref: ${item.id.split("-")[0]}`);
        pdf.addSection("Permit Details");
        pdf.addKeyValue("Permit Type", item.permitType);
        pdf.addStatusBadge("Status", item.status);
        pdf.addKeyValue("Requested By", item.requestedBy);
        pdf.addKeyValue("Authorised By", item.authorisedBy);
        pdf.addKeyValue("Location", item.location);
        pdf.addKeyValue("Start Date", pdfDate(item.startDate));
        pdf.addKeyValue("End Date", pdfDate(item.endDate));
        pdf.addSection("Work Description");
        pdf.addTextBlock("Description", item.description);
        pdf.addTextBlock("Precautions", item.precautions);
        pdf.addSection("Safety Checks");
        pdf.addKeyValue("Isolation Required", item.isolationRequired);
        pdf.addKeyValue("Gas Test Required", item.gasTestRequired);
        pdf.addKeyValue("Rescue Plan in Place", item.rescuePlanInPlace);
        const slug = item.permitType.toLowerCase().replace(/\s+/g, "-").slice(0, 30);
        pdf.save(`permit-${slug}-${item.id.split("-")[0]}.pdf`);
    };

    const updateStatus = (id: string, status: Permit["status"]) => {
        const item = items.find((i) => i.id === id);
        if (item) {
            editItem(id, { ...item, status });
            showToast(`Status updated to ${status}`);
        }
    };

    const statusBadge = (s: string) => {
        switch (s) {
            case "draft": return "badge-blue";
            case "pending": return "badge-yellow";
            case "active": return "badge-green";
            case "closed": return "badge-purple";
            default: return "badge-blue";
        }
    };

    const nextStatus = (s: Permit["status"]): Permit["status"] | null => {
        switch (s) {
            case "draft": return "pending";
            case "pending": return "active";
            case "active": return "closed";
            default: return null;
        }
    };

    if (showForm) {
        return (
            <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-2xl mx-auto">
                <button onClick={() => setShowForm(false)} className="btn btn-ghost mb-4" style={{ padding: "0.5rem 0" }}>
                    <ArrowLeft size={18} /> Back
                </button>
                <h1 className="text-xl font-bold mb-6" style={{ color: "var(--color-text-primary)" }}>
                    New Permit to Work
                </h1>

                <div className="space-y-4">
                    <div>
                        <label className="input-label">Permit Type *</label>
                        <select className="input-field" value={form.permitType} onChange={(e) => setForm({ ...form, permitType: e.target.value })}>
                            <option value="">Select type...</option>
                            {PERMIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="input-label">Description of Work *</label>
                        <textarea className="input-field" placeholder="Describe the work requiring a permit..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="input-label">Location</label>
                            <input className="input-field" placeholder="Where?" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                        </div>
                        <div>
                            <label className="input-label">Requested By</label>
                            <input className="input-field" placeholder="Your name" value={form.requestedBy} onChange={(e) => setForm({ ...form, requestedBy: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="input-label">Start Date/Time</label>
                            <input type="datetime-local" className="input-field" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                        </div>
                        <div>
                            <label className="input-label">End Date/Time</label>
                            <input type="datetime-local" className="input-field" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="input-label">Precautions & Controls</label>
                        <textarea className="input-field" placeholder="What precautions must be in place?" value={form.precautions} onChange={(e) => setForm({ ...form, precautions: e.target.value })} />
                    </div>

                    {/* Safety toggles */}
                    <div className="space-y-2">
                        <div className="card card-compact flex items-center justify-between" style={{ background: "var(--color-bg-secondary)" }}>
                            <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>Isolation Required?</span>
                            <div className={`toggle ${form.isolationRequired ? "active" : ""}`} onClick={() => setForm({ ...form, isolationRequired: !form.isolationRequired })} />
                        </div>
                        <div className="card card-compact flex items-center justify-between" style={{ background: "var(--color-bg-secondary)" }}>
                            <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>Gas Test Required?</span>
                            <div className={`toggle ${form.gasTestRequired ? "active" : ""}`} onClick={() => setForm({ ...form, gasTestRequired: !form.gasTestRequired })} />
                        </div>
                        <div className="card card-compact flex items-center justify-between" style={{ background: "var(--color-bg-secondary)" }}>
                            <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>Rescue Plan in Place?</span>
                            <div className={`toggle ${form.rescuePlanInPlace ? "active" : ""}`} onClick={() => setForm({ ...form, rescuePlanInPlace: !form.rescuePlanInPlace })} />
                        </div>
                    </div>

                    <div>
                        <label className="input-label">Authorised By</label>
                        <input className="input-field" placeholder="Supervisor/manager name" value={form.authorisedBy} onChange={(e) => setForm({ ...form, authorisedBy: e.target.value })} />
                    </div>

                    <button onClick={handleSave} className="btn btn-primary btn-full mt-4">
                        Create Permit
                    </button>
                </div>
            </div>
        );
    }

    return (
        <PremiumModuleGuard moduleName="Permits to Work">
            <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>Permits to Work</h1>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{totalRecords} permit{totalRecords !== 1 ? "s" : ""}</p>
                    </div>
                    <button onClick={() => setShowForm(true)} className="btn btn-primary">
                        <Plus size={16} /> New
                    </button>
                </div>

                <ModuleToolbar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    placeholder="Search permit type..."
                    onExport={exportData}
                    onImport={async (file) => {
                        try {
                            await importData(file);
                            showToast("Permits imported successfully");
                        } catch {
                            showToast("Failed to import permits", "error");
                        }
                    }}
                />

                {loading ? (
                    <RecordSkeleton count={3} />
                ) : filteredItems.length === 0 ? (
                    <div className="empty-state">
                        <ShieldCheck size={40} style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }} />
                        <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
                            {searchTerm || statusFilter !== "all" ? "No matching permits" : "No permits yet"}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                            {searchTerm || statusFilter !== "all" ? "Try adjusting your filters" : "Create permits for hot work, confined space, etc."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredItems.map((item, i) => (
                            <div key={item.id} className="card card-compact stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(59,130,246,0.1)" }}>
                                        <ShieldCheck size={16} style={{ color: "var(--color-safety-blue)" }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{item.permitType}</p>
                                            <span className={`badge ${statusBadge(item.status)}`}>{item.status.toUpperCase()}</span>
                                        </div>
                                        <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
                                            {item.description}
                                        </p>
                                        <p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                                            {item.location && `${item.location} · `}{formatDate(item.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-shrink-0">
                                        {nextStatus(item.status) && (
                                            <button
                                                onClick={() => updateStatus(item.id, nextStatus(item.status)!)}
                                                className="btn btn-secondary"
                                                style={{ padding: "0.25rem 0.5rem", fontSize: "10px" }}
                                            >
                                                → {nextStatus(item.status)?.toUpperCase()}
                                            </button>
                                        )}
                                        <button onClick={() => handleExportPDF(item)} className="btn btn-ghost" style={{ padding: "0.25rem 0.5rem", color: "var(--color-accent)" }} title="Export PDF">
                                            <FileDown size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="btn btn-ghost" style={{ padding: "0.25rem 0.5rem", color: "var(--color-safety-red)" }}>
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PremiumModuleGuard>
    );
}
