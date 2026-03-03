"use client";

import { useState, useEffect } from "react";
import { Plus, HeartPulse, ArrowLeft, Trash2, FileDown } from "lucide-react";
import { loadFromStore, saveToStore, generateId, formatDate } from "@/lib/utils";
import { SafeGuardPDF, pdfDateTime } from "@/lib/pdf-generator";

interface FirstAidEntry {
    id: string;
    dateTime: string;
    patientName: string;
    location: string;
    injuryIllness: string;
    treatmentGiven: string;
    administeredBy: string;
    outcome: "returned_to_work" | "sent_home" | "hospital" | "ambulance";
    followUp: string;
    createdAt: string;
}

const STORE_KEY = "first_aid_log";

const INJURY_TYPES = [
    "Cut / Wound", "Burn / Scald", "Bruise / Swelling", "Sprain / Strain",
    "Headache / Migraine", "Fainting / Dizziness", "Allergic Reaction",
    "Eye Injury / Irritation", "Breathing Difficulty", "Chest Pain",
    "Stomach / Nausea", "Back Pain", "Insect Sting / Bite", "Other",
];

export default function FirstAidPage() {
    const [items, setItems] = useState<FirstAidEntry[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        dateTime: "", patientName: "", location: "", injuryIllness: "",
        treatmentGiven: "", administeredBy: "", outcome: "returned_to_work" as FirstAidEntry["outcome"],
        followUp: "",
    });

    useEffect(() => { setItems(loadFromStore<FirstAidEntry[]>(STORE_KEY, [])); }, []);

    const handleSave = () => {
        if (!form.patientName.trim()) return;
        const newItem: FirstAidEntry = { id: generateId(), ...form, createdAt: new Date().toISOString() };
        const updated = [newItem, ...items];
        setItems(updated);
        saveToStore(STORE_KEY, updated);
        setShowForm(false);
        setForm({ dateTime: "", patientName: "", location: "", injuryIllness: "", treatmentGiven: "", administeredBy: "", outcome: "returned_to_work", followUp: "" });
    };

    const handleDelete = (id: string) => { const updated = items.filter((i) => i.id !== id); setItems(updated); saveToStore(STORE_KEY, updated); };

    const handleExportPDF = (item: FirstAidEntry) => {
        const pdf = new SafeGuardPDF();
        pdf.addHeader("First Aid Record", `Ref: ${item.id.split("-")[0]}`);
        pdf.addSection("Incident Details");
        pdf.addKeyValue("Date & Time", pdfDateTime(item.dateTime));
        pdf.addKeyValue("Location", item.location);
        pdf.addKeyValue("Patient Name", item.patientName);
        pdf.addSection("Injury & Treatment");
        pdf.addKeyValue("Injury/Illness", item.injuryIllness);
        pdf.addTextBlock("Treatment Given", item.treatmentGiven);
        pdf.addKeyValue("Administered By", item.administeredBy);
        pdf.addStatusBadge("Outcome", item.outcome);
        pdf.addSection("Follow-Up");
        pdf.addTextBlock("Follow-Up Required", item.followUp);
        pdf.save(`first-aid-${item.id.split("-")[0]}.pdf`);
    };

    const outcomeBadge = (o: string) => {
        switch (o) {
            case "returned_to_work": return { class: "badge-green", label: "Returned to Work" };
            case "sent_home": return { class: "badge-yellow", label: "Sent Home" };
            case "hospital": return { class: "badge-orange", label: "Hospital" };
            case "ambulance": return { class: "badge-red", label: "Ambulance" };
            default: return { class: "badge-blue", label: o };
        }
    };

    if (showForm) {
        return (
            <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-2xl mx-auto">
                <button onClick={() => setShowForm(false)} className="btn btn-ghost mb-4" style={{ padding: "0.5rem 0" }}><ArrowLeft size={18} /> Back</button>
                <h1 className="text-xl font-bold mb-6" style={{ color: "var(--color-text-primary)" }}>First Aid Entry</h1>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="input-label">Date & Time</label><input type="datetime-local" className="input-field" value={form.dateTime} onChange={(e) => setForm({ ...form, dateTime: e.target.value })} /></div>
                        <div><label className="input-label">Location</label><input className="input-field" placeholder="Where?" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                    </div>
                    <div><label className="input-label">Patient Name *</label><input className="input-field" placeholder="Name of person treated" value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} /></div>
                    <div><label className="input-label">Injury / Illness</label>
                        <select className="input-field" value={form.injuryIllness} onChange={(e) => setForm({ ...form, injuryIllness: e.target.value })}>
                            <option value="">Select type...</option>
                            {INJURY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div><label className="input-label">Treatment Given</label><textarea className="input-field" placeholder="What treatment was administered?" value={form.treatmentGiven} onChange={(e) => setForm({ ...form, treatmentGiven: e.target.value })} /></div>
                    <div><label className="input-label">Administered By</label><input className="input-field" placeholder="First aider name" value={form.administeredBy} onChange={(e) => setForm({ ...form, administeredBy: e.target.value })} /></div>
                    <div><label className="input-label">Outcome</label>
                        <select className="input-field" value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value as FirstAidEntry["outcome"] })}>
                            <option value="returned_to_work">Returned to Work</option>
                            <option value="sent_home">Sent Home</option>
                            <option value="hospital">Referred to Hospital</option>
                            <option value="ambulance">Ambulance Called</option>
                        </select>
                    </div>
                    <div><label className="input-label">Follow-Up Required</label><textarea className="input-field" placeholder="Any follow-up actions needed?" value={form.followUp} onChange={(e) => setForm({ ...form, followUp: e.target.value })} /></div>
                    <button onClick={handleSave} className="btn btn-primary btn-full mt-4">Save Entry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>First Aid Log</h1>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{items.length} entr{items.length !== 1 ? "ies" : "y"}</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary"><Plus size={16} /> Log</button>
            </div>
            {items.length === 0 ? (
                <div className="empty-state">
                    <HeartPulse size={40} style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>No first aid entries</p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Record all first aid treatment given on site</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {items.map((item, i) => (
                        <div key={item.id} className="card card-compact stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(239,68,68,0.1)" }}>
                                    <HeartPulse size={16} style={{ color: "var(--color-safety-red)" }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{item.patientName}</p>
                                        <span className={`badge ${outcomeBadge(item.outcome).class}`}>{outcomeBadge(item.outcome).label}</span>
                                    </div>
                                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{item.injuryIllness && `${item.injuryIllness} · `}{formatDate(item.createdAt)}</p>
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
