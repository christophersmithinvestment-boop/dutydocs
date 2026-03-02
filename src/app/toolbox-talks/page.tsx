"use client";

import { useState, useEffect } from "react";
import { Plus, Megaphone, ArrowLeft, Trash2, Users } from "lucide-react";
import { loadFromStore, saveToStore, generateId, formatDate } from "@/lib/utils";

interface ToolboxTalk {
    id: string;
    topic: string;
    presenter: string;
    date: string;
    keyPoints: string;
    attendees: string[];
    duration: string;
    createdAt: string;
}

const STORE_KEY = "toolbox_talks";

const SUGGESTED_TOPICS = [
    "Manual Handling", "Fire Safety", "Working at Height", "Electrical Safety",
    "PPE Usage", "First Aid Awareness", "Hazardous Substances", "Slip, Trip & Fall Prevention",
    "Toolbox Safety", "Noise at Work", "Lone Working", "Vehicle Safety",
];

export default function ToolboxTalksPage() {
    const [items, setItems] = useState<ToolboxTalk[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [newAttendee, setNewAttendee] = useState("");
    const [form, setForm] = useState({
        topic: "", presenter: "", date: "", keyPoints: "",
        attendees: [] as string[], duration: "",
    });

    useEffect(() => {
        setItems(loadFromStore<ToolboxTalk[]>(STORE_KEY, []));
    }, []);

    const addAttendee = () => {
        if (!newAttendee.trim()) return;
        setForm({ ...form, attendees: [...form.attendees, newAttendee.trim()] });
        setNewAttendee("");
    };

    const removeAttendee = (idx: number) => {
        setForm({ ...form, attendees: form.attendees.filter((_, i) => i !== idx) });
    };

    const handleSave = () => {
        if (!form.topic.trim()) return;
        const newItem: ToolboxTalk = { id: generateId(), ...form, createdAt: new Date().toISOString() };
        const updated = [newItem, ...items];
        setItems(updated);
        saveToStore(STORE_KEY, updated);
        setShowForm(false);
        setForm({ topic: "", presenter: "", date: "", keyPoints: "", attendees: [], duration: "" });
    };

    const handleDelete = (id: string) => {
        const updated = items.filter((i) => i.id !== id);
        setItems(updated);
        saveToStore(STORE_KEY, updated);
    };

    if (showForm) {
        return (
            <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-2xl mx-auto">
                <button onClick={() => setShowForm(false)} className="btn btn-ghost mb-4" style={{ padding: "0.5rem 0" }}>
                    <ArrowLeft size={18} /> Back
                </button>
                <h1 className="text-xl font-bold mb-6" style={{ color: "var(--color-text-primary)" }}>
                    Record Toolbox Talk
                </h1>

                <div className="space-y-4">
                    <div>
                        <label className="input-label">Topic *</label>
                        <input className="input-field" placeholder="e.g. Manual Handling Techniques" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
                    </div>

                    {/* Quick-select topics */}
                    <div>
                        <label className="input-label">Suggested Topics</label>
                        <div className="flex flex-wrap gap-1.5">
                            {SUGGESTED_TOPICS.map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setForm({ ...form, topic: t })}
                                    className={`badge cursor-pointer transition-all ${form.topic === t ? "badge-orange" : ""}`}
                                    style={{
                                        background: form.topic === t ? undefined : "var(--color-bg-input)",
                                        color: form.topic === t ? undefined : "var(--color-text-secondary)",
                                        border: "1px solid var(--color-border)",
                                        fontSize: "11px",
                                    }}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="input-label">Presenter</label>
                            <input className="input-field" placeholder="Who delivered?" value={form.presenter} onChange={(e) => setForm({ ...form, presenter: e.target.value })} />
                        </div>
                        <div>
                            <label className="input-label">Date</label>
                            <input type="date" className="input-field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="input-label">Duration</label>
                        <input className="input-field" placeholder="e.g. 15 minutes" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
                    </div>

                    <div>
                        <label className="input-label">Key Points Covered</label>
                        <textarea className="input-field" placeholder="Summary of what was discussed..." value={form.keyPoints} onChange={(e) => setForm({ ...form, keyPoints: e.target.value })} />
                    </div>

                    {/* Attendees */}
                    <div>
                        <label className="input-label">Attendees ({form.attendees.length})</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                className="input-field"
                                placeholder="Add attendee name"
                                value={newAttendee}
                                onChange={(e) => setNewAttendee(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAttendee(); } }}
                                style={{ flex: 1 }}
                            />
                            <button onClick={addAttendee} className="btn btn-secondary" style={{ flexShrink: 0 }}>
                                <Plus size={16} />
                            </button>
                        </div>
                        {form.attendees.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {form.attendees.map((name, idx) => (
                                    <span
                                        key={idx}
                                        className="badge badge-blue flex items-center gap-1 cursor-pointer"
                                        onClick={() => removeAttendee(idx)}
                                    >
                                        {name} <X size={10} />
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <button onClick={handleSave} className="btn btn-primary btn-full mt-4">
                        Save Toolbox Talk
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>Toolbox Talks</h1>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{items.length} talk{items.length !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    <Plus size={16} /> Record
                </button>
            </div>

            {items.length === 0 ? (
                <div className="empty-state">
                    <Megaphone size={40} style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>No toolbox talks recorded</p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Record pre-shift briefings and safety talks</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {items.map((item, i) => (
                        <div key={item.id} className="card card-compact stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(249,115,22,0.1)" }}>
                                    <Megaphone size={16} style={{ color: "var(--color-safety-orange)" }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{item.topic}</p>
                                    <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
                                        <span>{formatDate(item.createdAt)}</span>
                                        {item.attendees.length > 0 && (
                                            <span className="flex items-center gap-0.5">
                                                <Users size={10} /> {item.attendees.length}
                                            </span>
                                        )}
                                    </div>
                                </div>
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

function X({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
        </svg>
    );
}
