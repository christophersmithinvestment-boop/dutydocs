"use client";

import { useState, useRef } from "react";
import { Plus, Search, ArrowLeft, Trash2, Check, X, Minus, FileDown, Camera, Image, X as XIcon } from "lucide-react";
import { generateId, formatDate } from "@/lib/utils";
import { DutyDocsPDF, pdfDate } from "@/lib/pdf-generator";
import { useModuleData } from "@/hooks/useModuleData";
import PremiumModuleGuard from "@/components/PremiumModuleGuard";
import { RecordSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { ModuleToolbar } from "@/components/ModuleToolbar";

interface ChecklistItem {
    id: string;
    label: string;
    status: "pass" | "fail" | "na" | "unchecked";
    notes: string;
}

interface InspectionCategory {
    name: string;
    items: ChecklistItem[];
}

interface Inspection {
    id: string;
    siteName: string;
    inspectorName: string;
    date: string;
    categories: InspectionCategory[];
    overallNotes: string;
    photos: string[];
    score: number;
    totalChecked: number;
    totalPassed: number;
    createdAt: string;
}

const DEFAULT_CATEGORIES: { name: string; items: string[] }[] = [
    {
        name: "Fire Safety",
        items: ["Fire exits clear and unobstructed", "Fire extinguishers in date and accessible", "Fire alarm tested recently", "Emergency lighting functional", "Fire assembly point signage visible"],
    },
    {
        name: "Housekeeping",
        items: ["Work areas clean and tidy", "Walkways clear of obstructions", "Waste disposed of properly", "Spill kits available and stocked", "Storage areas organised"],
    },
    {
        name: "PPE",
        items: ["Correct PPE available for tasks", "PPE in good condition", "PPE signage displayed", "Eye wash stations accessible", "PPE storage clean and dry"],
    },
    {
        name: "Electrical Safety",
        items: ["PAT testing up to date", "No damaged cables or plugs", "Electrical panels accessible", "RCD protection in place", "Extension leads used safely"],
    },
    {
        name: "Working at Height",
        items: ["Ladders inspected and in good condition", "Edge protection in place", "Scaffolding tagged and inspected", "Harness anchor points available", "Roof access controlled"],
    },
];

function buildCategories(): InspectionCategory[] {
    return DEFAULT_CATEGORIES.map((cat) => ({
        name: cat.name,
        items: cat.items.map((label) => ({
            id: generateId(),
            label,
            status: "unchecked" as const,
            notes: "",
        })),
    }));
}

export default function InspectionsPage() {
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
    } = useModuleData<Inspection & { title: string }>({
        module: "inspections",
        storeKey: "inspections"
    });
    const { showToast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ siteName: "", inspectorName: "", date: "", overallNotes: "" });
    const [categories, setCategories] = useState<InspectionCategory[]>(() => buildCategories());
    const [expandedCat, setExpandedCat] = useState<string | null>(DEFAULT_CATEGORIES[0]?.name || null);
    const [photos, setPhotos] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new window.Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const MAX = 800;
                    let w = img.width, h = img.height;
                    if (w > MAX || h > MAX) {
                        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
                        else { w = Math.round(w * MAX / h); h = MAX; }
                    }
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext("2d")!;
                    ctx.drawImage(img, 0, 0, w, h);
                    resolve(canvas.toDataURL("image/jpeg", 0.7));
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const newPhotos: string[] = [];
        for (let i = 0; i < files.length; i++) {
            const compressed = await compressImage(files[i]);
            newPhotos.push(compressed);
        }
        setPhotos((prev) => [...prev, ...newPhotos]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removePhoto = (index: number) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    const toggleStatus = (catName: string, itemId: string) => {
        setCategories((prev) =>
            prev.map((cat) => {
                if (cat.name !== catName) return cat;
                return {
                    ...cat,
                    items: cat.items.map((item) => {
                        if (item.id !== itemId) return item;
                        const next: ChecklistItem["status"][] = ["unchecked", "pass", "fail", "na"];
                        const idx = next.indexOf(item.status);
                        return { ...item, status: next[(idx + 1) % next.length] };
                    }),
                };
            })
        );
    };

    const updateItemNotes = (catName: string, itemId: string, notes: string) => {
        setCategories((prev) =>
            prev.map((cat) => {
                if (cat.name !== catName) return cat;
                return {
                    ...cat,
                    items: cat.items.map((item) => item.id === itemId ? { ...item, notes } : item),
                };
            })
        );
    };

    const handleSave = () => {
        if (!form.siteName.trim()) return;
        const allItems = categories.flatMap((c) => c.items);
        const checked = allItems.filter((i) => i.status !== "unchecked");
        const passed = allItems.filter((i) => i.status === "pass");
        const applicableItems = allItems.filter((i) => i.status !== "na" && i.status !== "unchecked");
        const score = applicableItems.length > 0 ? Math.round((passed.length / applicableItems.length) * 100) : 0;

        const newItem: Inspection & { title: string } = {
            id: generateId(),
            ...form,
            title: form.siteName,
            categories,
            photos,
            score,
            totalChecked: checked.length,
            totalPassed: passed.length,
            createdAt: new Date().toISOString(),
        };
        addItem(newItem);
        showToast("Inspection saved successfully");
        setShowForm(false);
        setForm({ siteName: "", inspectorName: "", date: "", overallNotes: "" });
        setCategories(buildCategories());
        setPhotos([]);
    };

    const handleDelete = (id: string) => {
        removeItem(id);
        showToast("Inspection deleted", "info");
    };

    const handleExportPDF = (item: Inspection) => {
        const pdf = new DutyDocsPDF();
        pdf.addHeader("Site Inspection Report", `Ref: ${item.id.split("-")[0]}`);
        pdf.addSection("Inspection Details");
        pdf.addKeyValue("Site Name", item.siteName);
        pdf.addKeyValue("Inspector", item.inspectorName);
        pdf.addKeyValue("Date", pdfDate(item.date));
        pdf.addKeyValue("Overall Score", `${item.score}%`);
        pdf.addKeyValue("Items Passed", `${item.totalPassed} / ${item.totalChecked}`);
        for (const cat of item.categories) {
            pdf.addChecklistTable(
                cat.name,
                cat.items.map((i) => ({ label: i.label, status: i.status, notes: i.notes }))
            );
        }
        pdf.addSection("Overall Notes");
        pdf.addTextBlock("Notes", item.overallNotes);
        const slug = item.siteName.toLowerCase().replace(/\s+/g, "-").slice(0, 30);
        pdf.save(`inspection-${slug}.pdf`);
    };

    const statusIcon = (status: ChecklistItem["status"]) => {
        switch (status) {
            case "pass": return <Check size={14} />;
            case "fail": return <X size={14} />;
            case "na": return <Minus size={14} />;
            default: return null;
        }
    };

    const statusColor = (status: ChecklistItem["status"]) => {
        switch (status) {
            case "pass": return "var(--color-safety-green)";
            case "fail": return "var(--color-safety-red)";
            case "na": return "var(--color-text-muted)";
            default: return "var(--color-border-light)";
        }
    };

    if (showForm) {
        return (
            <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-2xl mx-auto">
                <button onClick={() => setShowForm(false)} className="btn btn-ghost mb-4" style={{ padding: "0.5rem 0" }}>
                    <ArrowLeft size={18} /> Back
                </button>
                <h1 className="text-xl font-bold mb-6" style={{ color: "var(--color-text-primary)" }}>
                    New Site Inspection
                </h1>

                <div className="space-y-4">
                    <div>
                        <label className="input-label">Site Name *</label>
                        <input className="input-field" placeholder="e.g. Main Office, Site A" value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="input-label">Inspector</label>
                            <input className="input-field" placeholder="Your name" value={form.inspectorName} onChange={(e) => setForm({ ...form, inspectorName: e.target.value })} />
                        </div>
                        <div>
                            <label className="input-label">Date</label>
                            <input type="date" className="input-field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                        </div>
                    </div>

                    {/* Checklist */}
                    <div>
                        <label className="input-label">Inspection Checklist</label>
                        <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
                            Tap the circle to cycle: ✓ Pass → ✗ Fail → — N/A
                        </p>
                        <div className="space-y-3">
                            {categories.map((cat) => (
                                <div key={cat.name} className="card" style={{ background: "var(--color-bg-secondary)", padding: 0 }}>
                                    <button
                                        onClick={() => setExpandedCat(expandedCat === cat.name ? null : cat.name)}
                                        className="w-full flex items-center justify-between p-4"
                                        style={{ background: "transparent", border: "none", cursor: "pointer" }}
                                    >
                                        <span className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{cat.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                                {cat.items.filter((i) => i.status === "pass").length}/{cat.items.length}
                                            </span>
                                        </div>
                                    </button>
                                    {expandedCat === cat.name && (
                                        <div className="px-4 pb-4 space-y-2">
                                            {cat.items.map((item) => (
                                                <div key={item.id}>
                                                    <div
                                                        className={`checklist-item ${item.status === "pass" ? "checked" : item.status === "fail" ? "failed" : ""}`}
                                                        onClick={() => toggleStatus(cat.name, item.id)}
                                                    >
                                                        <div
                                                            className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                                                            style={{
                                                                borderColor: statusColor(item.status),
                                                                background: item.status !== "unchecked" ? `${statusColor(item.status)}20` : "transparent",
                                                                color: statusColor(item.status),
                                                            }}
                                                        >
                                                            {statusIcon(item.status)}
                                                        </div>
                                                        <span className="text-sm flex-1" style={{ color: "var(--color-text-primary)" }}>{item.label}</span>
                                                    </div>
                                                    {item.status === "fail" && (
                                                        <input
                                                            className="input-field mt-1"
                                                            placeholder="Add notes about this failure..."
                                                            value={item.notes}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e) => updateItemNotes(cat.name, item.id, e.target.value)}
                                                            style={{ fontSize: "12px", padding: "0.5rem 0.75rem" }}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="input-label">Overall Notes</label>
                        <textarea className="input-field" placeholder="Any additional observations..." value={form.overallNotes} onChange={(e) => setForm({ ...form, overallNotes: e.target.value })} />
                    </div>

                    {/* Photo Capture */}
                    <div>
                        <label className="input-label">Photos</label>
                        <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>
                            Capture evidence photos directly from your camera
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            multiple
                            onChange={handlePhotoCapture}
                            style={{ display: "none" }}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="btn btn-secondary"
                            style={{
                                display: "flex", alignItems: "center", gap: "0.5rem",
                                width: "100%", justifyContent: "center",
                                padding: "0.75rem",
                                border: "2px dashed var(--color-border-light)",
                                borderRadius: "12px",
                            }}
                        >
                            <Camera size={18} /> Take Photo or Upload
                        </button>

                        {photos.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mt-3">
                                {photos.map((photo, idx) => (
                                    <div key={idx} style={{ position: "relative", borderRadius: "10px", overflow: "hidden", aspectRatio: "1", background: "var(--color-bg-secondary)" }}>
                                        <img src={photo} alt={`Photo ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        <button
                                            onClick={() => removePhoto(idx)}
                                            style={{
                                                position: "absolute", top: 4, right: 4,
                                                width: 24, height: 24, borderRadius: "50%",
                                                background: "rgba(0,0,0,0.6)", border: "none",
                                                color: "white", cursor: "pointer",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button onClick={handleSave} className="btn btn-primary btn-full mt-4">
                        Save Inspection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <PremiumModuleGuard moduleName="Site Inspections">
            <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>Site Inspections</h1>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{totalRecords} inspection{totalRecords !== 1 ? "s" : ""}</p>
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
                    placeholder="Search sites..."
                    onExport={exportData}
                    onImport={async (file) => {
                        try {
                            await importData(file);
                            showToast("Inspections imported successfully");
                        } catch {
                            showToast("Failed to import inspections", "error");
                        }
                    }}
                />

                {loading ? (
                    <RecordSkeleton count={3} />
                ) : filteredItems.length === 0 ? (
                    <div className="empty-state">
                        <Search size={40} style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }} />
                        <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
                            {searchTerm || statusFilter !== "all" ? "No matching inspections" : "No inspections yet"}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                            {searchTerm || statusFilter !== "all" ? "Try adjusting your filters" : "Run a site inspection with built-in checklists"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredItems.map((item, i) => (
                            <div key={item.id} className="card card-compact stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                                        style={{
                                            background: item.score >= 80 ? "rgba(16,185,129,0.15)" : item.score >= 50 ? "rgba(234,179,8,0.15)" : "rgba(239,68,68,0.15)",
                                            color: item.score >= 80 ? "var(--color-safety-green)" : item.score >= 50 ? "var(--color-safety-yellow)" : "var(--color-safety-red)",
                                        }}
                                    >
                                        {item.score}%
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{item.siteName}</p>
                                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                            {item.totalPassed}/{item.totalChecked} passed · {formatDate(item.createdAt)}
                                            {item.photos?.length > 0 && ` · 📷 ${item.photos.length} photo${item.photos.length !== 1 ? "s" : ""}`}
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
