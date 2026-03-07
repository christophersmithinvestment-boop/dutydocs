"use client";

import { useState } from "react";
import { Plus, Package, ArrowLeft, Trash2, AlertCircle, FileDown } from "lucide-react";
import { generateId, formatDate } from "@/lib/utils";
import { DutyDocsPDF, pdfDate } from "@/lib/pdf-generator";
import { useModuleData } from "@/hooks/useModuleData";
import PremiumModuleGuard from "@/components/PremiumModuleGuard";
import { RecordSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { ModuleToolbar } from "@/components/ModuleToolbar";

interface AssetRecord {
    id: string;
    assetName: string;
    assetType: string;
    location: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    purchaseDate: string;
    lastInspectionDate: string;
    nextInspectionDue: string;
    condition: "good" | "fair" | "poor" | "out-of-service";
    assignedTo: string;
    notes: string;
    createdAt: string;
}

const ASSET_TYPES = [
    "Ladder", "Scaffold", "Fire Extinguisher", "First Aid Kit", "Emergency Lighting",
    "PAT Equipment", "Gas Detector", "Forklift", "Crane / Hoist", "Safety Harness",
    "Pressure Vessel", "Vehicle", "Power Tools", "Hand Tools", "Ventilation Unit",
    "Chemical Cabinet", "Spill Kit", "Defibrillator", "Eye Wash Station", "Other",
];

const emptyForm = {
    assetName: "", assetType: "", location: "", manufacturer: "", model: "",
    serialNumber: "", purchaseDate: "", lastInspectionDate: "", nextInspectionDue: "",
    condition: "good" as AssetRecord["condition"], assignedTo: "", notes: "",
};

export default function AssetRegisterPage() {
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
    } = useModuleData<AssetRecord & { title: string }>({
        module: "asset_register",
        storeKey: "asset_register"
    });
    const { showToast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ ...emptyForm });

    const handleSave = () => {
        if (!form.assetName.trim() || !form.assetType) return;
        const newItem: AssetRecord & { title: string } = {
            id: generateId(),
            ...form,
            title: form.assetName,
            createdAt: new Date().toISOString()
        };
        addItem(newItem);
        showToast("Asset registered successfully");
        setShowForm(false);
        setForm({ ...emptyForm });
    };

    const handleDelete = (id: string) => {
        removeItem(id);
        showToast("Asset removed", "info");
    };

    const handleExportPDF = (item: AssetRecord) => {
        const pdf = new DutyDocsPDF();
        pdf.addHeader("Asset Register Entry", `Ref: ${item.id.split("-")[0]}`);
        pdf.addSection("Asset Details");
        pdf.addKeyValue("Asset Name", item.assetName);
        pdf.addKeyValue("Asset Type", item.assetType);
        pdf.addKeyValue("Location", item.location);
        pdf.addKeyValue("Manufacturer", item.manufacturer);
        pdf.addKeyValue("Model", item.model);
        pdf.addKeyValue("Serial / Tag Number", item.serialNumber);
        pdf.addSection("Dates & Scheduling");
        pdf.addKeyValue("Purchase Date", pdfDate(item.purchaseDate));
        pdf.addKeyValue("Last Inspection", pdfDate(item.lastInspectionDate));
        pdf.addKeyValue("Next Inspection Due", pdfDate(item.nextInspectionDue));
        pdf.addSection("Status");
        pdf.addStatusBadge("Condition", item.condition);
        pdf.addKeyValue("Assigned To", item.assignedTo);
        pdf.addTextBlock("Notes", item.notes);
        const slug = item.assetName.toLowerCase().replace(/\s+/g, "-").slice(0, 30);
        pdf.save(`asset-${slug}.pdf`);
    };

    const isOverdue = (date: string) => date && new Date(date) < new Date();
    const isDueSoon = (date: string) => {
        if (!date) return false;
        const d = new Date(date);
        const now = new Date();
        const diff = d.getTime() - now.getTime();
        return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
    };

    const conditionLabel = (c: string) => {
        switch (c) {
            case "good": return "GOOD";
            case "fair": return "FAIR";
            case "poor": return "POOR";
            case "out-of-service": return "OUT OF SERVICE";
            default: return c.toUpperCase();
        }
    };
    const conditionBadge = (c: string) => {
        switch (c) {
            case "good": return "badge-green";
            case "fair": return "badge-yellow";
            case "poor": return "badge-red";
            case "out-of-service": return "badge-red";
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
                    Register Asset
                </h1>
                <div className="space-y-4">
                    <div>
                        <label className="input-label">Asset Name *</label>
                        <input className="input-field" placeholder="e.g. Fire Extinguisher #3, Ladder A" value={form.assetName} onChange={(e) => setForm({ ...form, assetName: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="input-label">Asset Type *</label>
                            <select className="input-field" value={form.assetType} onChange={(e) => setForm({ ...form, assetType: e.target.value })}>
                                <option value="">Select type...</option>
                                {ASSET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Location</label>
                            <input className="input-field" placeholder="e.g. Building A, Floor 2" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="input-label">Manufacturer</label>
                            <input className="input-field" placeholder="Brand" value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} />
                        </div>
                        <div>
                            <label className="input-label">Model</label>
                            <input className="input-field" placeholder="Model number" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Serial / Tag Number</label>
                        <input className="input-field" placeholder="S/N or asset tag" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="input-label">Purchase Date</label>
                            <input type="date" className="input-field" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
                        </div>
                        <div>
                            <label className="input-label">Assigned To</label>
                            <input className="input-field" placeholder="Responsible person" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="input-label">Last Inspection</label>
                            <input type="date" className="input-field" value={form.lastInspectionDate} onChange={(e) => setForm({ ...form, lastInspectionDate: e.target.value })} />
                        </div>
                        <div>
                            <label className="input-label">Next Inspection Due</label>
                            <input type="date" className="input-field" value={form.nextInspectionDue} onChange={(e) => setForm({ ...form, nextInspectionDue: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Condition</label>
                        <select className="input-field" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value as AssetRecord["condition"] })}>
                            <option value="good">Good — Fully operational</option>
                            <option value="fair">Fair — Minor wear, still usable</option>
                            <option value="poor">Poor — Needs repair</option>
                            <option value="out-of-service">Out of Service — Do not use</option>
                        </select>
                    </div>
                    <div>
                        <label className="input-label">Notes</label>
                        <textarea className="input-field" placeholder="Any additional notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                    </div>
                    <button onClick={handleSave} className="btn btn-primary btn-full mt-4">Register Asset</button>
                </div>
            </div>
        );
    }

    return (
        <PremiumModuleGuard moduleName="Asset Register">
            <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>Asset Register</h1>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{totalRecords} asset{totalRecords !== 1 ? "s" : ""} registered</p>
                    </div>
                    <button onClick={() => setShowForm(true)} className="btn btn-primary"><Plus size={16} /> Add</button>
                </div>

                <ModuleToolbar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    placeholder="Search assets..."
                    onExport={exportData}
                    onImport={async (file) => {
                        try {
                            await importData(file);
                            showToast("Assets imported successfully");
                        } catch {
                            showToast("Failed to import assets", "error");
                        }
                    }}
                />

                {loading ? (
                    <RecordSkeleton count={3} />
                ) : filteredItems.length === 0 ? (
                    <div className="empty-state">
                        <Package size={40} style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }} />
                        <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
                            {searchTerm || statusFilter !== "all" ? "No matching assets" : "No assets registered"}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                            {searchTerm || statusFilter !== "all" ? "Try adjusting your filters" : "Track equipment, inspections, and certification dates"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredItems.map((item, i) => (
                            <div key={item.id} className="card card-compact stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: "rgba(20,184,166,0.1)" }}
                                    >
                                        <Package size={18} style={{ color: "#14b8a6" }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{item.assetName}</p>
                                            <span className={`badge ${conditionBadge(item.condition)}`}>{conditionLabel(item.condition)}</span>
                                            {isOverdue(item.nextInspectionDue) && <span className="badge badge-red">OVERDUE</span>}
                                            {isDueSoon(item.nextInspectionDue) && !isOverdue(item.nextInspectionDue) && <span className="badge badge-yellow">DUE SOON</span>}
                                        </div>
                                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                            {item.assetType}
                                            {item.location && ` · ${item.location}`}
                                            {item.nextInspectionDue && ` · Due: ${formatDate(item.nextInspectionDue)}`}
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
        </PremiumModuleGuard>
    );
}
