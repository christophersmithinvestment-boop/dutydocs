"use client";

import { useState, useEffect } from "react";
import { Plus, Phone, ArrowLeft, Trash2, PhoneCall } from "lucide-react";
import { loadFromStore, saveToStore, generateId } from "@/lib/utils";

interface EmergencyContact {
    id: string;
    name: string;
    role: string;
    phone: string;
    alternatePhone: string;
    category: string;
    notes: string;
    createdAt: string;
}

const STORE_KEY = "emergency_contacts";

const CATEGORIES = [
    "Site Manager", "Health & Safety Officer", "First Aider", "Fire Warden",
    "Security", "Building Manager", "Environmental Officer",
    "Emergency Services", "Hospital / A&E", "Utility Company",
    "Insurance", "HSE (Health & Safety Executive)", "Client Contact", "Other",
];

// Pre-populated emergency services
const DEFAULT_CONTACTS: Omit<EmergencyContact, "id" | "createdAt">[] = [
    { name: "Emergency Services", role: "Police, Fire, Ambulance", phone: "999", alternatePhone: "112", category: "Emergency Services", notes: "" },
    { name: "HSE (Health & Safety Executive)", role: "Report RIDDOR incidents", phone: "0345 300 9923", alternatePhone: "", category: "HSE (Health & Safety Executive)", notes: "www.hse.gov.uk" },
    { name: "NHS 111", role: "Non-emergency medical advice", phone: "111", alternatePhone: "", category: "Hospital / A&E", notes: "Available 24/7" },
];

export default function EmergencyContactsPage() {
    const [items, setItems] = useState<EmergencyContact[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: "", role: "", phone: "", alternatePhone: "", category: "", notes: "",
    });

    useEffect(() => {
        const stored = loadFromStore<EmergencyContact[]>(STORE_KEY, []);
        if (stored.length === 0) {
            // Initialize with defaults
            const defaults = DEFAULT_CONTACTS.map((c) => ({ ...c, id: generateId(), createdAt: new Date().toISOString() }));
            setItems(defaults);
            saveToStore(STORE_KEY, defaults);
        } else {
            setItems(stored);
        }
    }, []);

    const handleSave = () => {
        if (!form.name.trim() || !form.phone.trim()) return;
        const newItem: EmergencyContact = { id: generateId(), ...form, createdAt: new Date().toISOString() };
        const updated = [newItem, ...items];
        setItems(updated);
        saveToStore(STORE_KEY, updated);
        setShowForm(false);
        setForm({ name: "", role: "", phone: "", alternatePhone: "", category: "", notes: "" });
    };

    const handleDelete = (id: string) => { const updated = items.filter((i) => i.id !== id); setItems(updated); saveToStore(STORE_KEY, updated); };

    const categoryColor = (cat: string) => {
        if (cat.includes("Emergency")) return "var(--color-safety-red)";
        if (cat.includes("First Aider")) return "var(--color-safety-green)";
        if (cat.includes("Fire")) return "var(--color-safety-orange)";
        if (cat.includes("Manager") || cat.includes("Officer")) return "var(--color-safety-blue)";
        return "var(--color-safety-purple)";
    };

    if (showForm) {
        return (
            <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-2xl mx-auto">
                <button onClick={() => setShowForm(false)} className="btn btn-ghost mb-4" style={{ padding: "0.5rem 0" }}><ArrowLeft size={18} /> Back</button>
                <h1 className="text-xl font-bold mb-6" style={{ color: "var(--color-text-primary)" }}>Add Emergency Contact</h1>
                <div className="space-y-4">
                    <div><label className="input-label">Name *</label><input className="input-field" placeholder="Contact name or service" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                    <div><label className="input-label">Role / Description</label><input className="input-field" placeholder="e.g. Site First Aider" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
                    <div><label className="input-label">Category</label>
                        <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                            <option value="">Select...</option>
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="input-label">Phone Number *</label><input type="tel" className="input-field" placeholder="Primary number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                        <div><label className="input-label">Alternate Number</label><input type="tel" className="input-field" placeholder="Backup number" value={form.alternatePhone} onChange={(e) => setForm({ ...form, alternatePhone: e.target.value })} /></div>
                    </div>
                    <div><label className="input-label">Notes</label><textarea className="input-field" placeholder="Any additional info..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                    <button onClick={handleSave} className="btn btn-primary btn-full mt-4">Save Contact</button>
                </div>
            </div>
        );
    }

    // Group by category
    const grouped = items.reduce<Record<string, EmergencyContact[]>>((acc, item) => {
        const cat = item.category || "Other";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    return (
        <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>Emergency Contacts</h1>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{items.length} contact{items.length !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary"><Plus size={16} /> Add</button>
            </div>

            {items.length === 0 ? (
                <div className="empty-state">
                    <Phone size={40} style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>No emergency contacts</p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Add key numbers for emergencies</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {Object.entries(grouped).map(([category, contacts]) => (
                        <div key={category}>
                            <p className="section-header px-1">{category}</p>
                            <div className="space-y-2">
                                {contacts.map((item, i) => (
                                    <div key={item.id} className="card card-compact stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${categoryColor(category)}15` }}>
                                                <Phone size={16} style={{ color: categoryColor(category) }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{item.name}</p>
                                                {item.role && <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{item.role}</p>}
                                                <p className="text-xs font-mono mt-0.5" style={{ color: "var(--color-safety-green)" }}>{item.phone}</p>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <a href={`tel:${item.phone}`} className="btn btn-success" style={{ padding: "0.5rem", borderRadius: "50%" }}>
                                                    <PhoneCall size={14} />
                                                </a>
                                                <button onClick={() => handleDelete(item.id)} className="btn btn-ghost" style={{ padding: "0.5rem", color: "var(--color-safety-red)" }}><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
