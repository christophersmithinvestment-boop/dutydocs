"use client";

import { useState, useEffect } from "react";
import { Plus, Monitor, ArrowLeft, Trash2, Check, X, Minus, FileDown } from "lucide-react";
import { loadFromStore, saveToStore, generateId, formatDate } from "@/lib/utils";
import { SafeGuardPDF, pdfDate } from "@/lib/pdf-generator";

interface DSEItem {
    id: string;
    label: string;
    status: "pass" | "fail" | "na" | "unchecked";
    notes: string;
}

interface DSECategory {
    name: string;
    items: DSEItem[];
}

interface DSEAssessment {
    id: string;
    employeeName: string;
    department: string;
    workstationLocation: string;
    assessorName: string;
    date: string;
    categories: DSECategory[];
    additionalNotes: string;
    actionRequired: string;
    score: number;
    createdAt: string;
}

const STORE_KEY = "dse_assessments";

const DEFAULT_CATEGORIES: { name: string; items: string[] }[] = [
    {
        name: "Display Screen",
        items: [
            "Screen image is stable and flicker-free",
            "Screen brightness and contrast are adjustable",
            "Screen is clean and free from glare",
            "Text size is comfortable to read",
            "Screen is positioned at arm's length away",
            "Top of screen is at or slightly below eye level",
        ],
    },
    {
        name: "Keyboard & Mouse",
        items: [
            "Keyboard is separate from the screen",
            "Keyboard can tilt and is at comfortable height",
            "There is space in front of keyboard for wrists",
            "Mouse is positioned close to keyboard",
            "Mouse moves smoothly and is comfortable to use",
            "Wrist rest available if needed",
        ],
    },
    {
        name: "Chair",
        items: [
            "Chair is stable with 5-star base",
            "Seat height is adjustable",
            "Seat back provides good lumbar support",
            "Backrest is adjustable for height and tilt",
            "Armrests (if present) don't prevent close working",
            "Feet are flat on floor or on footrest",
        ],
    },
    {
        name: "Desk & Work Area",
        items: [
            "Desk surface is large enough for equipment",
            "Desk is at appropriate height",
            "There is adequate legroom under the desk",
            "Frequently used items are within easy reach",
            "Work area is free from clutter",
            "Document holder available if needed",
        ],
    },
    {
        name: "Environment",
        items: [
            "Lighting is adequate without causing glare",
            "Temperature is comfortable",
            "Noise levels are acceptable",
            "Ventilation is adequate",
            "No trailing cables or trip hazards",
        ],
    },
];

function buildCategories(): DSECategory[] {
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

export default function DSEPage() {
    const [items, setItems] = useState<DSEAssessment[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ employeeName: "", department: "", workstationLocation: "", assessorName: "", date: "", additionalNotes: "", actionRequired: "" });
    const [categories, setCategories] = useState<DSECategory[]>(() => buildCategories());
    const [expandedCat, setExpandedCat] = useState<string | null>(DEFAULT_CATEGORIES[0]?.name || null);

    useEffect(() => { setItems(loadFromStore<DSEAssessment[]>(STORE_KEY, [])); }, []);

    const toggleStatus = (catName: string, itemId: string) => {
        setCategories((prev) =>
            prev.map((cat) => {
                if (cat.name !== catName) return cat;
                return {
                    ...cat, items: cat.items.map((item) => {
                        if (item.id !== itemId) return item;
                        const order: DSEItem["status"][] = ["unchecked", "pass", "fail", "na"];
                        return { ...item, status: order[(order.indexOf(item.status) + 1) % order.length] };
                    })
                };
            })
        );
    };

    const updateItemNotes = (catName: string, itemId: string, notes: string) => {
        setCategories((prev) =>
            prev.map((cat) => {
                if (cat.name !== catName) return cat;
                return { ...cat, items: cat.items.map((item) => item.id === itemId ? { ...item, notes } : item) };
            })
        );
    };

    const handleSave = () => {
        if (!form.employeeName.trim()) return;
        const allItems = categories.flatMap((c) => c.items);
        const passed = allItems.filter((i) => i.status === "pass");
        const applicable = allItems.filter((i) => i.status !== "na" && i.status !== "unchecked");
        const score = applicable.length > 0 ? Math.round((passed.length / applicable.length) * 100) : 0;
        const newItem: DSEAssessment = { id: generateId(), ...form, categories, score, createdAt: new Date().toISOString() };
        const updated = [newItem, ...items];
        setItems(updated);
        saveToStore(STORE_KEY, updated);
        setShowForm(false);
        setForm({ employeeName: "", department: "", workstationLocation: "", assessorName: "", date: "", additionalNotes: "", actionRequired: "" });
        setCategories(buildCategories());
    };

    const handleDelete = (id: string) => { const updated = items.filter((i) => i.id !== id); setItems(updated); saveToStore(STORE_KEY, updated); };

    const handleExportPDF = (item: DSEAssessment) => {
        const pdf = new SafeGuardPDF();
        pdf.addHeader("DSE Assessment", `Ref: ${item.id.split("-")[0]}`);
        pdf.addSection("Assessment Details");
        pdf.addKeyValue("Employee", item.employeeName);
        pdf.addKeyValue("Department", item.department);
        pdf.addKeyValue("Workstation Location", item.workstationLocation);
        pdf.addKeyValue("Assessor", item.assessorName);
        pdf.addKeyValue("Date", pdfDate(item.date));
        pdf.addKeyValue("Score", `${item.score}%`);
        for (const cat of item.categories) {
            pdf.addChecklistTable(cat.name, cat.items.map((i) => ({ label: i.label, status: i.status, notes: i.notes })));
        }
        pdf.addSection("Additional Notes & Actions");
        pdf.addTextBlock("Additional Notes", item.additionalNotes);
        pdf.addTextBlock("Action Required", item.actionRequired);
        const slug = item.employeeName.toLowerCase().replace(/\s+/g, "-").slice(0, 30);
        pdf.save(`dse-assessment-${slug}.pdf`);
    };

    const statusIcon = (s: DSEItem["status"]) => { switch (s) { case "pass": return <Check size={14} />; case "fail": return <X size={14} />; case "na": return <Minus size={14} />; default: return null; } };
    const statusColor = (s: DSEItem["status"]) => { switch (s) { case "pass": return "var(--color-safety-green)"; case "fail": return "var(--color-safety-red)"; case "na": return "var(--color-text-muted)"; default: return "var(--color-border-light)"; } };

    if (showForm) {
        return (
            <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-2xl mx-auto">
                <button onClick={() => setShowForm(false)} className="btn btn-ghost mb-4" style={{ padding: "0.5rem 0" }}><ArrowLeft size={18} /> Back</button>
                <h1 className="text-xl font-bold mb-6" style={{ color: "var(--color-text-primary)" }}>New DSE Assessment</h1>
                <div className="space-y-4">
                    <div>
                        <label className="input-label">Employee Name *</label>
                        <input className="input-field" placeholder="Name of person being assessed" value={form.employeeName} onChange={(e) => setForm({ ...form, employeeName: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="input-label">Department</label><input className="input-field" placeholder="e.g. Finance" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
                        <div><label className="input-label">Workstation Location</label><input className="input-field" placeholder="e.g. Office 2B" value={form.workstationLocation} onChange={(e) => setForm({ ...form, workstationLocation: e.target.value })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="input-label">Assessor</label><input className="input-field" placeholder="Your name" value={form.assessorName} onChange={(e) => setForm({ ...form, assessorName: e.target.value })} /></div>
                        <div><label className="input-label">Date</label><input type="date" className="input-field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                    </div>

                    <div>
                        <label className="input-label">Workstation Checklist</label>
                        <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>Tap the circle: ✓ Pass → ✗ Fail → — N/A</p>
                        <div className="space-y-3">
                            {categories.map((cat) => (
                                <div key={cat.name} className="card" style={{ background: "var(--color-bg-secondary)", padding: 0 }}>
                                    <button onClick={() => setExpandedCat(expandedCat === cat.name ? null : cat.name)} className="w-full flex items-center justify-between p-4" style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                                        <span className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{cat.name}</span>
                                        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{cat.items.filter((i) => i.status === "pass").length}/{cat.items.length}</span>
                                    </button>
                                    {expandedCat === cat.name && (
                                        <div className="px-4 pb-4 space-y-2">
                                            {cat.items.map((item) => (
                                                <div key={item.id}>
                                                    <div className={`checklist-item ${item.status === "pass" ? "checked" : item.status === "fail" ? "failed" : ""}`} onClick={() => toggleStatus(cat.name, item.id)}>
                                                        <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: statusColor(item.status), background: item.status !== "unchecked" ? `${statusColor(item.status)}20` : "transparent", color: statusColor(item.status) }}>
                                                            {statusIcon(item.status)}
                                                        </div>
                                                        <span className="text-sm flex-1" style={{ color: "var(--color-text-primary)" }}>{item.label}</span>
                                                    </div>
                                                    {item.status === "fail" && (
                                                        <input className="input-field mt-1" placeholder="Action needed..." value={item.notes} onClick={(e) => e.stopPropagation()} onChange={(e) => updateItemNotes(cat.name, item.id, e.target.value)} style={{ fontSize: "12px", padding: "0.5rem 0.75rem" }} />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div><label className="input-label">Actions Required</label><textarea className="input-field" placeholder="List any corrective actions needed..." value={form.actionRequired} onChange={(e) => setForm({ ...form, actionRequired: e.target.value })} /></div>
                    <div><label className="input-label">Additional Notes</label><textarea className="input-field" placeholder="Any other observations..." value={form.additionalNotes} onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })} /></div>

                    <button onClick={handleSave} className="btn btn-primary btn-full mt-4">Save DSE Assessment</button>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>DSE Assessments</h1>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{items.length} assessment{items.length !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary"><Plus size={16} /> New</button>
            </div>
            {items.length === 0 ? (
                <div className="empty-state">
                    <Monitor size={40} style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>No DSE assessments yet</p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Assess display screen equipment workstations</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {items.map((item, i) => (
                        <div key={item.id} className="card card-compact stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ background: item.score >= 80 ? "rgba(16,185,129,0.15)" : item.score >= 50 ? "rgba(234,179,8,0.15)" : "rgba(239,68,68,0.15)", color: item.score >= 80 ? "var(--color-safety-green)" : item.score >= 50 ? "var(--color-safety-yellow)" : "var(--color-safety-red)" }}>{item.score}%</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{item.employeeName}</p>
                                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{item.workstationLocation && `${item.workstationLocation} · `}{formatDate(item.createdAt)}</p>
                                </div>
                                <button onClick={() => handleExportPDF(item)} className="btn btn-ghost" style={{ padding: "0.5rem", color: "var(--color-accent)" }} title="Export PDF"><FileDown size={16} /></button>
                                <button onClick={() => handleDelete(item.id)} className="btn btn-ghost" style={{ padding: "0.5rem", color: "var(--color-safety-red)" }}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
