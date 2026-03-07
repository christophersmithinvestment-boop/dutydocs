"use client";

import { useState } from "react";
import { Plus, Flame, ArrowLeft, Trash2, Users, Clock, FileDown } from "lucide-react";
import { generateId, formatDate } from "@/lib/utils";
import { DutyDocsPDF, pdfDate } from "@/lib/pdf-generator";
import { useModuleData } from "@/hooks/useModuleData";
import PremiumModuleGuard from "@/components/PremiumModuleGuard";
import { RecordSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { ModuleToolbar } from "@/components/ModuleToolbar";

interface FireDrill {
    id: string;
    date: string;
    time: string;
    location: string;
    drillType: string;
    alarmActivatedBy: string;
    evacuationTime: string;
    totalEvacuees: string;
    assemblyPoint: string;
    allAccountedFor: boolean;
    fireWardens: string;
    issuesIdentified: string;
    correctiveActions: string;
    conductedBy: string;
    outcome: "pass" | "fail" | "partial";
    createdAt: string;
}

const DRILL_TYPES = ["Planned Evacuation", "Unannounced Drill", "Partial Evacuation", "Night Shift Drill", "Weekend Drill"];

export default function FireDrillPage() {
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
    } = useModuleData<FireDrill & { title: string }>({
        module: "fire_drills",
        storeKey: "fire_drills"
    });
    const { showToast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        date: "", time: "", location: "", drillType: "", alarmActivatedBy: "",
        evacuationTime: "", totalEvacuees: "", assemblyPoint: "", allAccountedFor: true,
        fireWardens: "", issuesIdentified: "", correctiveActions: "", conductedBy: "",
        outcome: "pass" as FireDrill["outcome"],
    });

    const handleSave = () => {
        if (!form.date || !form.location.trim()) return;
        const newItem: FireDrill & { title: string } = {
            id: generateId(),
            ...form,
            title: form.location,
            createdAt: new Date().toISOString()
        };
        addItem(newItem);
        showToast("Fire drill logged successfully");
        setShowForm(false);
        setForm({ date: "", time: "", location: "", drillType: "", alarmActivatedBy: "", evacuationTime: "", totalEvacuees: "", assemblyPoint: "", allAccountedFor: true, fireWardens: "", issuesIdentified: "", correctiveActions: "", conductedBy: "", outcome: "pass" });
    };

    const handleDelete = (id: string) => {
        removeItem(id);
        showToast("Drill record deleted", "info");
    };

    const handleExportPDF = (item: FireDrill) => {
        const pdf = new DutyDocsPDF();
        pdf.addHeader("Fire Drill Record", `Ref: ${item.id.split("-")[0]}`);
        pdf.addSection("Drill Details");
        pdf.addKeyValue("Date", pdfDate(item.date));
        pdf.addKeyValue("Time", item.time);
        pdf.addKeyValue("Location", item.location);
        pdf.addKeyValue("Drill Type", item.drillType);
        pdf.addKeyValue("Conducted By", item.conductedBy);
        pdf.addStatusBadge("Outcome", item.outcome);
        pdf.addSection("Evacuation Details");
        pdf.addKeyValue("Alarm Activated By", item.alarmActivatedBy);
        pdf.addKeyValue("Evacuation Time", item.evacuationTime);
        pdf.addKeyValue("Total Evacuees", item.totalEvacuees);
        pdf.addKeyValue("Assembly Point", item.assemblyPoint);
        pdf.addKeyValue("All Accounted For", item.allAccountedFor);
        pdf.addKeyValue("Fire Wardens", item.fireWardens);
        pdf.addSection("Issues & Actions");
        pdf.addTextBlock("Issues Identified", item.issuesIdentified);
        pdf.addTextBlock("Corrective Actions", item.correctiveActions);
        pdf.save(`fire-drill-${item.id.split("-")[0]}.pdf`);
    };

    const outcomeBadge = (o: string) => {
        switch (o) {
            case "pass": return "badge-green";
            case "fail": return "badge-red";
            case "partial": return "badge-yellow";
            default: return "badge-blue";
        }
    };

    if (showForm) {
        return (
            <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-2xl mx-auto">
                <button onClick={() => setShowForm(false)} className="btn btn-ghost mb-4" style={{ padding: "0.5rem 0" }}><ArrowLeft size={18} /> Back</button>
                <h1 className="text-xl font-bold mb-6" style={{ color: "var(--color-text-primary)" }}>Log Fire Drill</h1>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="input-label">Date *</label><input type="date" className="input-field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                        <div><label className="input-label">Time</label><input type="time" className="input-field" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="input-label">Location *</label><input className="input-field" placeholder="Building/site" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                        <div><label className="input-label">Drill Type</label>
                            <select className="input-field" value={form.drillType} onChange={(e) => setForm({ ...form, drillType: e.target.value })}>
                                <option value="">Select...</option>
                                {DRILL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="card" style={{ background: "var(--color-bg-secondary)" }}>
                        <p className="text-sm font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>Evacuation Details</p>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="input-label">Evacuation Time</label><input className="input-field" placeholder="e.g. 3 min 20 sec" value={form.evacuationTime} onChange={(e) => setForm({ ...form, evacuationTime: e.target.value })} /></div>
                                <div><label className="input-label">Total Evacuees</label><input className="input-field" placeholder="Number of people" value={form.totalEvacuees} onChange={(e) => setForm({ ...form, totalEvacuees: e.target.value })} /></div>
                            </div>
                            <div><label className="input-label">Assembly Point</label><input className="input-field" placeholder="e.g. Car Park A" value={form.assemblyPoint} onChange={(e) => setForm({ ...form, assemblyPoint: e.target.value })} /></div>
                            <div><label className="input-label">Alarm Activated By</label><input className="input-field" placeholder="Who triggered the alarm?" value={form.alarmActivatedBy} onChange={(e) => setForm({ ...form, alarmActivatedBy: e.target.value })} /></div>
                            <div><label className="input-label">Fire Wardens Present</label><input className="input-field" placeholder="Names of fire wardens" value={form.fireWardens} onChange={(e) => setForm({ ...form, fireWardens: e.target.value })} /></div>
                        </div>
                    </div>

                    <div className="card card-compact flex items-center justify-between" style={{ background: "var(--color-bg-secondary)" }}>
                        <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>All Personnel Accounted For?</span>
                        <div className={`toggle ${form.allAccountedFor ? "active" : ""}`} onClick={() => setForm({ ...form, allAccountedFor: !form.allAccountedFor })} />
                    </div>

                    <div><label className="input-label">Outcome</label>
                        <select className="input-field" value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value as FireDrill["outcome"] })}>
                            <option value="pass">Pass — Successful evacuation</option>
                            <option value="partial">Partial — Minor issues identified</option>
                            <option value="fail">Fail — Significant problems</option>
                        </select>
                    </div>

                    <div><label className="input-label">Issues Identified</label><textarea className="input-field" placeholder="Any problems during the drill..." value={form.issuesIdentified} onChange={(e) => setForm({ ...form, issuesIdentified: e.target.value })} /></div>
                    <div><label className="input-label">Corrective Actions</label><textarea className="input-field" placeholder="Actions to address issues..." value={form.correctiveActions} onChange={(e) => setForm({ ...form, correctiveActions: e.target.value })} /></div>
                    <div><label className="input-label">Conducted By</label><input className="input-field" placeholder="Your name" value={form.conductedBy} onChange={(e) => setForm({ ...form, conductedBy: e.target.value })} /></div>

                    <button onClick={handleSave} className="btn btn-primary btn-full mt-4">Save Fire Drill</button>
                </div>
            </div>
        );
    }

    return (
        <PremiumModuleGuard moduleName="Fire Drill Log">
            <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>Fire Drill Log</h1>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{totalRecords} drill{totalRecords !== 1 ? "s" : ""} recorded</p>
                    </div>
                    <button onClick={() => setShowForm(true)} className="btn btn-primary"><Plus size={16} /> Log Drill</button>
                </div>

                <ModuleToolbar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    placeholder="Search location..."
                    onExport={exportData}
                    onImport={async (file) => {
                        try {
                            await importData(file);
                            showToast("Drills imported successfully");
                        } catch {
                            showToast("Failed to import drills", "error");
                        }
                    }}
                />

                {loading ? (
                    <RecordSkeleton count={3} />
                ) : filteredItems.length === 0 ? (
                    <div className="empty-state">
                        <Flame size={40} style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }} />
                        <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
                            {searchTerm || statusFilter !== "all" ? "No matching drills" : "No fire drills logged"}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                            {searchTerm || statusFilter !== "all" ? "Try adjusting your filters" : "Record fire evacuation drills and results"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredItems.map((item, i) => (
                            <div key={item.id} className="card card-compact stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(239,68,68,0.1)" }}>
                                        <Flame size={16} style={{ color: "var(--color-safety-red)" }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{item.location}</p>
                                            <span className={`badge ${outcomeBadge(item.outcome)}`}>{item.outcome.toUpperCase()}</span>
                                        </div>
                                        <p className="text-xs flex items-center gap-2" style={{ color: "var(--color-text-muted)" }}>
                                            {formatDate(item.date)}
                                            {item.evacuationTime && <span className="flex items-center gap-0.5"><Clock size={10} /> {item.evacuationTime}</span>}
                                            {item.totalEvacuees && <span className="flex items-center gap-0.5"><Users size={10} /> {item.totalEvacuees}</span>}
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
