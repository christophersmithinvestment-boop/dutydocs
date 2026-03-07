"use client";

import { useState } from "react";
import { Plus, HardHat, ArrowLeft, Trash2, AlertCircle, FileDown } from "lucide-react";
import { generateId, formatDate, getExpiryStatus, getExpiryBadgeClass } from "@/lib/utils";
import { DutyDocsPDF, pdfDate } from "@/lib/pdf-generator";
import { useModuleData } from "@/hooks/useModuleData";
import PremiumModuleGuard from "@/components/PremiumModuleGuard";
import { RecordSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { ModuleToolbar } from "@/components/ModuleToolbar";

interface PPERecord {
    id: string;
    employeeName: string;
    department: string;
    ppeType: string;
    manufacturer: string;
    serialNumber: string;
    dateIssued: string;
    expiryDate: string;
    condition: "good" | "fair" | "replace";
    lastInspected: string;
    notes: string;
    createdAt: string;
}

const PPE_TYPES = [
    "Hard Hat", "Safety Boots", "Hi-Vis Vest", "Safety Goggles", "Face Shield",
    "Ear Defenders", "Ear Plugs", "Nitrile Gloves", "Chemical Gloves", "Rigger Gloves",
    "Respirator (FFP2)", "Respirator (FFP3)", "Full Face Respirator",
    "Safety Harness", "Lanyard", "Fall Arrest Block",
    "Chemical Suit", "Lab Coat", "Welding Mask", "Cut-Resistant Gloves",
];

export default function PPERegisterPage() {
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
    } = useModuleData<PPERecord & { title: string }>({
        module: "ppe_register",
        storeKey: "ppe_register"
    });
    const { showToast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        employeeName: "", department: "", ppeType: "", manufacturer: "", serialNumber: "",
        dateIssued: "", expiryDate: "", condition: "good" as PPERecord["condition"],
        lastInspected: "", notes: "",
    });

    const handleSave = () => {
        if (!form.employeeName.trim() || !form.ppeType) return;
        const newItem: PPERecord & { title: string } = {
            id: generateId(),
            ...form,
            title: `${form.employeeName} - ${form.ppeType}`,
            createdAt: new Date().toISOString()
        };
        addItem(newItem);
        showToast("PPE item registered successfully");
        setShowForm(false);
        setForm({ employeeName: "", department: "", ppeType: "", manufacturer: "", serialNumber: "", dateIssued: "", expiryDate: "", condition: "good", lastInspected: "", notes: "" });
    };

    const handleDelete = (id: string) => {
        removeItem(id);
        showToast("Item removed", "info");
    };

    const handleExportPDF = (item: PPERecord) => {
        const pdf = new DutyDocsPDF();
        pdf.addHeader("PPE Record", `Ref: ${item.id.split("-")[0]}`);
        pdf.addSection("Equipment Details");
        pdf.addKeyValue("PPE Type", item.ppeType);
        pdf.addKeyValue("Manufacturer", item.manufacturer);
        pdf.addKeyValue("Serial Number", item.serialNumber);
        pdf.addSection("Assignment");
        pdf.addKeyValue("Employee", item.employeeName);
        pdf.addKeyValue("Department", item.department);
        pdf.addKeyValue("Date Issued", pdfDate(item.dateIssued));
        pdf.addSection("Condition & Expiry");
        pdf.addStatusBadge("Condition", item.condition);
        pdf.addKeyValue("Expiry Date", pdfDate(item.expiryDate));
        pdf.addKeyValue("Last Inspected", pdfDate(item.lastInspected));
        pdf.addTextBlock("Notes", item.notes);
        pdf.save(`ppe-record-${item.id.split("-")[0]}.pdf`);
    };

    const expiredCount = items.filter((i) => getExpiryStatus(i.expiryDate) === "expired").length;
    const expiringCount = items.filter((i) => getExpiryStatus(i.expiryDate) === "expiring").length;

    const conditionBadge = (c: string) => {
        switch (c) {
            case "good": return "badge-green";
            case "fair": return "badge-yellow";
            case "replace": return "badge-red";
            default: return "badge-blue";
        }
    };

    if (showForm) {
        return (
            <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-2xl mx-auto">
                <button onClick={() => setShowForm(false)} className="btn btn-ghost mb-4" style={{ padding: "0.5rem 0" }}><ArrowLeft size={18} /> Back</button>
                <h1 className="text-xl font-bold mb-6" style={{ color: "var(--color-text-primary)" }}>Register PPE Item</h1>
                <div className="space-y-4">
                    <div><label className="input-label">Employee Name *</label><input className="input-field" placeholder="Who is this PPE issued to?" value={form.employeeName} onChange={(e) => setForm({ ...form, employeeName: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="input-label">Department</label><input className="input-field" placeholder="e.g. Construction" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
                        <div><label className="input-label">PPE Type *</label>
                            <select className="input-field" value={form.ppeType} onChange={(e) => setForm({ ...form, ppeType: e.target.value })}>
                                <option value="">Select type...</option>
                                {PPE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="input-label">Manufacturer</label><input className="input-field" placeholder="Brand" value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} /></div>
                        <div><label className="input-label">Serial Number</label><input className="input-field" placeholder="S/N" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="input-label">Date Issued</label><input type="date" className="input-field" value={form.dateIssued} onChange={(e) => setForm({ ...form, dateIssued: e.target.value })} /></div>
                        <div><label className="input-label">Expiry Date</label><input type="date" className="input-field" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></div>
                    </div>
                    <div><label className="input-label">Condition</label>
                        <select className="input-field" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value as PPERecord["condition"] })}>
                            <option value="good">Good — No issues</option>
                            <option value="fair">Fair — Minor wear</option>
                            <option value="replace">Replace — Damaged/worn out</option>
                        </select>
                    </div>
                    <div><label className="input-label">Last Inspected</label><input type="date" className="input-field" value={form.lastInspected} onChange={(e) => setForm({ ...form, lastInspected: e.target.value })} /></div>
                    <div><label className="input-label">Notes</label><textarea className="input-field" placeholder="Any additional notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                    <button onClick={handleSave} className="btn btn-primary btn-full mt-4">Register PPE</button>
                </div>
            </div>
        );
    }

    return (
        <PremiumModuleGuard moduleName="PPE Register">
            <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>PPE Register</h1>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{totalRecords} item{totalRecords !== 1 ? "s" : ""} registered</p>
                    </div>
                    <button onClick={() => setShowForm(true)} className="btn btn-primary"><Plus size={16} /> Add</button>
                </div>

                <ModuleToolbar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    placeholder="Search name or item..."
                    onExport={exportData}
                    onImport={async (file) => {
                        try {
                            await importData(file);
                            showToast("Records imported successfully");
                        } catch {
                            showToast("Failed to import records", "error");
                        }
                    }}
                />

                {/* Alerts */}
                {(expiredCount > 0 || expiringCount > 0) && (
                    <div className="mb-4 space-y-2">
                        {expiredCount > 0 && (
                            <div className="card card-compact flex items-center gap-3" style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}>
                                <AlertCircle size={16} style={{ color: "var(--color-safety-red)", flexShrink: 0 }} />
                                <span className="text-sm font-medium" style={{ color: "var(--color-safety-red)" }}>{expiredCount} expired item{expiredCount !== 1 ? "s" : ""} — replacement required</span>
                            </div>
                        )}
                        {expiringCount > 0 && (
                            <div className="card card-compact flex items-center gap-3" style={{ borderColor: "rgba(234,179,8,0.3)", background: "rgba(234,179,8,0.05)" }}>
                                <AlertCircle size={16} style={{ color: "var(--color-safety-yellow)", flexShrink: 0 }} />
                                <span className="text-sm font-medium" style={{ color: "var(--color-safety-yellow)" }}>{expiringCount} item{expiringCount !== 1 ? "s" : ""} expiring within 30 days</span>
                            </div>
                        )}
                    </div>
                )}

                {loading ? (
                    <RecordSkeleton count={3} />
                ) : filteredItems.length === 0 ? (
                    <div className="empty-state">
                        <HardHat size={40} style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }} />
                        <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
                            {searchTerm || statusFilter !== "all" ? "No matching items" : "No PPE registered"}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                            {searchTerm || statusFilter !== "all" ? "Try adjusting your filters" : "Track PPE issued to staff with expiry dates"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredItems.map((item, i) => (
                            <div key={item.id} className="card card-compact stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(59,130,246,0.1)" }}>
                                        <HardHat size={16} style={{ color: "var(--color-safety-blue)" }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{item.ppeType}</p>
                                            <span className={`badge ${conditionBadge(item.condition)}`}>{item.condition.toUpperCase()}</span>
                                            {getExpiryStatus(item.expiryDate) !== "valid" && getExpiryStatus(item.expiryDate) !== "none" && (
                                                <span className={`badge ${getExpiryBadgeClass(getExpiryStatus(item.expiryDate))}`}>
                                                    {getExpiryStatus(item.expiryDate).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                            {item.employeeName}{item.department && ` · ${item.department}`}
                                            {item.expiryDate && ` · Exp: ${formatDate(item.expiryDate)}`}
                                        </p>
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
