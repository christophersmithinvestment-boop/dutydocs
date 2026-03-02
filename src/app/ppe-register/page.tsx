"use client";

import { useState, useEffect } from "react";
import { Plus, HardHat, ArrowLeft, Trash2, AlertCircle } from "lucide-react";
import { loadFromStore, saveToStore, generateId, formatDate } from "@/lib/utils";

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

const STORE_KEY = "ppe_register";

const PPE_TYPES = [
    "Hard Hat", "Safety Boots", "Hi-Vis Vest", "Safety Goggles", "Face Shield",
    "Ear Defenders", "Ear Plugs", "Nitrile Gloves", "Chemical Gloves", "Rigger Gloves",
    "Respirator (FFP2)", "Respirator (FFP3)", "Full Face Respirator",
    "Safety Harness", "Lanyard", "Fall Arrest Block",
    "Chemical Suit", "Lab Coat", "Welding Mask", "Cut-Resistant Gloves",
];

export default function PPERegisterPage() {
    const [items, setItems] = useState<PPERecord[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        employeeName: "", department: "", ppeType: "", manufacturer: "", serialNumber: "",
        dateIssued: "", expiryDate: "", condition: "good" as PPERecord["condition"],
        lastInspected: "", notes: "",
    });

    useEffect(() => { setItems(loadFromStore<PPERecord[]>(STORE_KEY, [])); }, []);

    const handleSave = () => {
        if (!form.employeeName.trim() || !form.ppeType) return;
        const newItem: PPERecord = { id: generateId(), ...form, createdAt: new Date().toISOString() };
        const updated = [newItem, ...items];
        setItems(updated);
        saveToStore(STORE_KEY, updated);
        setShowForm(false);
        setForm({ employeeName: "", department: "", ppeType: "", manufacturer: "", serialNumber: "", dateIssued: "", expiryDate: "", condition: "good", lastInspected: "", notes: "" });
    };

    const handleDelete = (id: string) => { const updated = items.filter((i) => i.id !== id); setItems(updated); saveToStore(STORE_KEY, updated); };

    const isExpired = (date: string) => date && new Date(date) < new Date();
    const isExpiringSoon = (date: string) => {
        if (!date) return false;
        const d = new Date(date);
        const now = new Date();
        const diff = d.getTime() - now.getTime();
        return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
    };

    const conditionBadge = (c: string) => { switch (c) { case "good": return "badge-green"; case "fair": return "badge-yellow"; case "replace": return "badge-red"; default: return "badge-blue"; } };

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
        <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>PPE Register</h1>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{items.length} item{items.length !== 1 ? "s" : ""} registered</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary"><Plus size={16} /> Add</button>
            </div>
            {items.length === 0 ? (
                <div className="empty-state">
                    <HardHat size={40} style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>No PPE registered</p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Track PPE issued to staff with expiry dates</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {items.map((item, i) => (
                        <div key={item.id} className="card card-compact stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(59,130,246,0.1)" }}>
                                    <HardHat size={16} style={{ color: "var(--color-safety-blue)" }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{item.ppeType}</p>
                                        <span className={`badge ${conditionBadge(item.condition)}`}>{item.condition.toUpperCase()}</span>
                                        {isExpired(item.expiryDate) && <span className="badge badge-red">EXPIRED</span>}
                                        {isExpiringSoon(item.expiryDate) && !isExpired(item.expiryDate) && <span className="badge badge-yellow">EXPIRING</span>}
                                    </div>
                                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                        {item.employeeName}{item.department && ` · ${item.department}`}
                                        {item.expiryDate && ` · Exp: ${formatDate(item.expiryDate)}`}
                                    </p>
                                </div>
                                <button onClick={() => handleDelete(item.id)} className="btn btn-ghost" style={{ padding: "0.5rem", color: "var(--color-safety-red)" }}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
