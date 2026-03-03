"use client";

import { useState, useEffect } from "react";
import { Plus, FlaskConical, ArrowLeft, Trash2, FileDown } from "lucide-react";
import { loadFromStore, saveToStore, generateId, formatDate } from "@/lib/utils";
import { SafeGuardPDF, pdfDate } from "@/lib/pdf-generator";

interface COSHHAssessment {
    id: string;
    substanceName: string;
    manufacturer: string;
    usedFor: string;
    location: string;
    hazardSymbols: string[];
    exposureRoutes: string[];
    healthEffects: string;
    controlMeasures: string;
    ppeRequired: string[];
    emergencyProcedures: string;
    storageRequirements: string;
    assessor: string;
    reviewDate: string;
    createdAt: string;
}

const STORE_KEY = "coshh_assessments";

const GHS_SYMBOLS = [
    "Flammable", "Oxidiser", "Explosive", "Corrosive",
    "Toxic", "Harmful/Irritant", "Health Hazard",
    "Environmental", "Gas Under Pressure",
];

const EXPOSURE_ROUTES = ["Inhalation", "Skin Contact", "Ingestion", "Eye Contact"];

const PPE_OPTIONS = [
    "Safety Goggles", "Face Shield", "Nitrile Gloves", "Chemical Gloves",
    "Respirator (FFP2)", "Respirator (FFP3)", "Chemical Suit", "Lab Coat/Apron",
    "Safety Boots", "Ear Defenders",
];

export default function COSHHPage() {
    const [items, setItems] = useState<COSHHAssessment[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        substanceName: "", manufacturer: "", usedFor: "", location: "",
        hazardSymbols: [] as string[], exposureRoutes: [] as string[],
        healthEffects: "", controlMeasures: "", ppeRequired: [] as string[],
        emergencyProcedures: "", storageRequirements: "", assessor: "", reviewDate: "",
    });

    useEffect(() => {
        setItems(loadFromStore<COSHHAssessment[]>(STORE_KEY, []));
    }, []);

    const toggleArrayItem = (arr: string[], item: string) =>
        arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

    const handleSave = () => {
        if (!form.substanceName.trim()) return;
        const newItem: COSHHAssessment = { id: generateId(), ...form, createdAt: new Date().toISOString() };
        const updated = [newItem, ...items];
        setItems(updated);
        saveToStore(STORE_KEY, updated);
        setShowForm(false);
        setForm({
            substanceName: "", manufacturer: "", usedFor: "", location: "",
            hazardSymbols: [], exposureRoutes: [], healthEffects: "", controlMeasures: "",
            ppeRequired: [], emergencyProcedures: "", storageRequirements: "", assessor: "", reviewDate: "",
        });
    };

    const handleDelete = (id: string) => {
        const updated = items.filter((i) => i.id !== id);
        setItems(updated);
        saveToStore(STORE_KEY, updated);
    };

    const handleExportPDF = (item: COSHHAssessment) => {
        const pdf = new SafeGuardPDF();
        pdf.addHeader("COSHH Assessment", `Ref: ${item.id.split("-")[0]}`);
        pdf.addSection("Substance Details");
        pdf.addKeyValue("Substance Name", item.substanceName);
        pdf.addKeyValue("Manufacturer", item.manufacturer);
        pdf.addKeyValue("Used For", item.usedFor);
        pdf.addKeyValue("Location", item.location);
        pdf.addKeyValue("Assessor", item.assessor);
        pdf.addKeyValue("Created", pdfDate(item.createdAt));
        pdf.addKeyValue("Review Date", pdfDate(item.reviewDate));
        pdf.addSection("Hazard Information");
        pdf.addTagList("GHS Hazard Symbols", item.hazardSymbols);
        pdf.addTagList("Exposure Routes", item.exposureRoutes);
        pdf.addTextBlock("Health Effects", item.healthEffects);
        pdf.addSection("Controls & PPE");
        pdf.addTextBlock("Control Measures", item.controlMeasures);
        pdf.addTagList("PPE Required", item.ppeRequired);
        pdf.addSection("Emergency & Storage");
        pdf.addTextBlock("Emergency Procedures", item.emergencyProcedures);
        pdf.addTextBlock("Storage Requirements", item.storageRequirements);
        const slug = item.substanceName.toLowerCase().replace(/\s+/g, "-").slice(0, 30);
        pdf.save(`coshh-${slug}.pdf`);
    };

    if (showForm) {
        return (
            <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-2xl mx-auto">
                <button onClick={() => setShowForm(false)} className="btn btn-ghost mb-4" style={{ padding: "0.5rem 0" }}>
                    <ArrowLeft size={18} /> Back
                </button>
                <h1 className="text-xl font-bold mb-6" style={{ color: "var(--color-text-primary)" }}>
                    New COSHH Assessment
                </h1>

                <div className="space-y-4">
                    <div>
                        <label className="input-label">Substance Name *</label>
                        <input className="input-field" placeholder="e.g. Sodium Hypochlorite" value={form.substanceName} onChange={(e) => setForm({ ...form, substanceName: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="input-label">Manufacturer</label>
                            <input className="input-field" placeholder="Company name" value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} />
                        </div>
                        <div>
                            <label className="input-label">Location Used</label>
                            <input className="input-field" placeholder="e.g. Kitchen area" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="input-label">What is it used for?</label>
                        <input className="input-field" placeholder="Describe the use of this substance" value={form.usedFor} onChange={(e) => setForm({ ...form, usedFor: e.target.value })} />
                    </div>

                    {/* GHS Hazard Symbols */}
                    <div>
                        <label className="input-label">GHS Hazard Symbols</label>
                        <div className="flex flex-wrap gap-2">
                            {GHS_SYMBOLS.map((symbol) => (
                                <button
                                    key={symbol}
                                    type="button"
                                    onClick={() => setForm({ ...form, hazardSymbols: toggleArrayItem(form.hazardSymbols, symbol) })}
                                    className={`badge cursor-pointer transition-all ${form.hazardSymbols.includes(symbol) ? "badge-red" : ""}`}
                                    style={{
                                        background: form.hazardSymbols.includes(symbol) ? undefined : "var(--color-bg-input)",
                                        color: form.hazardSymbols.includes(symbol) ? undefined : "var(--color-text-secondary)",
                                        border: "1px solid var(--color-border)",
                                    }}
                                >
                                    {symbol}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Exposure Routes */}
                    <div>
                        <label className="input-label">Exposure Routes</label>
                        <div className="flex flex-wrap gap-2">
                            {EXPOSURE_ROUTES.map((route) => (
                                <button
                                    key={route}
                                    type="button"
                                    onClick={() => setForm({ ...form, exposureRoutes: toggleArrayItem(form.exposureRoutes, route) })}
                                    className={`badge cursor-pointer transition-all ${form.exposureRoutes.includes(route) ? "badge-orange" : ""}`}
                                    style={{
                                        background: form.exposureRoutes.includes(route) ? undefined : "var(--color-bg-input)",
                                        color: form.exposureRoutes.includes(route) ? undefined : "var(--color-text-secondary)",
                                        border: "1px solid var(--color-border)",
                                    }}
                                >
                                    {route}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="input-label">Health Effects</label>
                        <textarea className="input-field" placeholder="Describe potential health effects..." value={form.healthEffects} onChange={(e) => setForm({ ...form, healthEffects: e.target.value })} />
                    </div>
                    <div>
                        <label className="input-label">Control Measures</label>
                        <textarea className="input-field" placeholder="How will exposure be controlled?" value={form.controlMeasures} onChange={(e) => setForm({ ...form, controlMeasures: e.target.value })} />
                    </div>

                    {/* PPE Required */}
                    <div>
                        <label className="input-label">PPE Required</label>
                        <div className="flex flex-wrap gap-2">
                            {PPE_OPTIONS.map((ppe) => (
                                <button
                                    key={ppe}
                                    type="button"
                                    onClick={() => setForm({ ...form, ppeRequired: toggleArrayItem(form.ppeRequired, ppe) })}
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
                        <label className="input-label">Emergency Procedures</label>
                        <textarea className="input-field" placeholder="First aid and spillage procedures..." value={form.emergencyProcedures} onChange={(e) => setForm({ ...form, emergencyProcedures: e.target.value })} />
                    </div>
                    <div>
                        <label className="input-label">Storage Requirements</label>
                        <textarea className="input-field" placeholder="How should this substance be stored?" value={form.storageRequirements} onChange={(e) => setForm({ ...form, storageRequirements: e.target.value })} />
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
                        Save COSHH Assessment
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>COSHH Assessments</h1>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{items.length} assessment{items.length !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    <Plus size={16} /> New
                </button>
            </div>

            {items.length === 0 ? (
                <div className="empty-state">
                    <FlaskConical size={40} style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>No COSHH assessments yet</p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Tap &quot;New&quot; to add a substance assessment</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {items.map((item, i) => (
                        <div key={item.id} className="card card-compact stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(168,85,247,0.1)" }}>
                                    <FlaskConical size={16} style={{ color: "var(--color-safety-purple)" }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{item.substanceName}</p>
                                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                        {item.manufacturer && `${item.manufacturer} · `}{formatDate(item.createdAt)}
                                    </p>
                                    {item.hazardSymbols.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {item.hazardSymbols.map((s) => (
                                                <span key={s} className="badge badge-red" style={{ fontSize: "9px", padding: "1px 6px" }}>{s}</span>
                                            ))}
                                        </div>
                                    )}
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
