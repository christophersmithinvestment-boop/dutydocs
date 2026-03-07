"use client";

import { useState } from "react";
import { Plus, Megaphone, ArrowLeft, Trash2, Users, FileDown, X as LucideX } from "lucide-react";
import { generateId, formatDate } from "@/lib/utils";
import { DutyDocsPDF, pdfDate } from "@/lib/pdf-generator";
import { useModuleData } from "@/hooks/useModuleData";
import PremiumModuleGuard from "@/components/PremiumModuleGuard";
import { RecordSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { ModuleToolbar } from "@/components/ModuleToolbar";

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

const SUGGESTED_TOPICS = [
    "Manual Handling", "Fire Safety", "Working at Height", "Electrical Safety",
    "PPE Usage", "First Aid Awareness", "Hazardous Substances", "Slip, Trip & Fall Prevention",
    "Toolbox Safety", "Noise at Work", "Lone Working", "Vehicle Safety",
];

export default function ToolboxTalksPage() {
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
    } = useModuleData<ToolboxTalk & { title: string }>({
        module: "toolbox_talks",
        storeKey: "toolbox_talks"
    });
    const { showToast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [newAttendee, setNewAttendee] = useState("");
    const [form, setForm] = useState({
        topic: "", presenter: "", date: "", keyPoints: "",
        attendees: [] as string[], duration: "",
    });

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
        const newItem: ToolboxTalk & { title: string } = {
            id: generateId(),
            ...form,
            title: form.topic,
            createdAt: new Date().toISOString()
        };
        addItem(newItem);
        showToast("Toolbox talk recorded successfully");
        setShowForm(false);
        setForm({ topic: "", presenter: "", date: "", keyPoints: "", attendees: [], duration: "" });
    };

    const handleDelete = (id: string) => {
        removeItem(id);
        showToast("Record deleted", "info");
    };

    const handleExportPDF = (item: ToolboxTalk) => {
        const pdf = new DutyDocsPDF();
        pdf.addHeader("Toolbox Talk Record", `Ref: ${item.id.split("-")[0]}`);
        pdf.addSection("Talk Details");
        pdf.addKeyValue("Topic", item.topic);
        pdf.addKeyValue("Presenter", item.presenter);
        pdf.addKeyValue("Date", pdfDate(item.date));
        pdf.addKeyValue("Duration", item.duration);
        pdf.addSection("Key Points");
        pdf.addTextBlock("Points Covered", item.keyPoints);
        pdf.addSection("Attendees");
        if (item.attendees.length > 0) {
            pdf.addTable(
                ["#", "Name"],
                item.attendees.map((a, i) => [String(i + 1), a]),
                [15, 155]
            );
        }
        const slug = item.topic.toLowerCase().replace(/\s+/g, "-").slice(0, 30);
        pdf.save(`toolbox-talk-${slug}.pdf`);
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
                                        {name} <LucideX size={10} />
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
        <PremiumModuleGuard moduleName="Toolbox Talks">
            <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>Toolbox Talks</h1>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{totalRecords} talk{totalRecords !== 1 ? "s" : ""}</p>
                    </div>
                    <button onClick={() => setShowForm(true)} className="btn btn-primary">
                        <Plus size={16} /> Record
                    </button>
                </div>

                <ModuleToolbar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    placeholder="Search topics..."
                    onExport={exportData}
                    onImport={async (file) => {
                        try {
                            await importData(file);
                            showToast("Talks imported successfully");
                        } catch {
                            showToast("Failed to import talks", "error");
                        }
                    }}
                />

                {loading ? (
                    <RecordSkeleton count={3} />
                ) : filteredItems.length === 0 ? (
                    <div className="empty-state">
                        <Megaphone size={40} style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }} />
                        <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
                            {searchTerm || statusFilter !== "all" ? "No matching talks" : "No toolbox talks recorded"}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                            {searchTerm || statusFilter !== "all" ? "Try adjusting your filters" : "Record pre-shift briefings and safety talks"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredItems.map((item, i) => (
                            <div key={item.id} className="card card-compact stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(249,115,22,0.1)" }}>
                                        <Megaphone size={16} style={{ color: "var(--color-safety-orange)" }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{item.topic}</p>
                                        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
                                            <span>{formatDate(item.date || item.createdAt)}</span>
                                            {item.attendees.length > 0 && (
                                                <span className="flex items-center gap-0.5">
                                                    <Users size={10} /> {item.attendees.length}
                                                </span>
                                            )}
                                        </div>
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
