"use client";

import { useState } from "react";
import { Plus, FileText, ArrowLeft, Trash2, FileDown, Pencil } from "lucide-react";
import { generateId, formatDate } from "@/lib/utils";
import { DutyDocsPDF, pdfDate } from "@/lib/pdf-generator";
import { useModuleData } from "@/hooks/useModuleData";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradeModal from "@/components/UpgradeModal";
import { ModuleToolbar } from "@/components/ModuleToolbar";
import { RecordSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

// A method statement is the "how the work will be carried out safely"
// document — sequenced steps, who does each one, what they need to be
// competent to do it. Risk scoring (likelihood/severity/hazards/controls)
// deliberately lives in the Risk Assessment module, not here, so the two
// stay genuinely distinct instead of duplicating each other.
interface MethodStatementStep {
    id: string;
    description: string;
    responsiblePerson: string;
    competencyRequired: string;
}

interface MethodStatement {
    id: string;
    taskTitle: string;
    projectName: string;
    location: string;
    preparedBy: string;
    taskDescription: string;
    steps: MethodStatementStep[];
    ppeRequired: string[];
    plantEquipment: string;
    emergencyProcedures: string;
    reviewDate: string;
    createdAt: string;
}

const PPE_LIST = [
    "Hard Hat", "Hi-Vis Vest", "Safety Boots", "Safety Goggles",
    "Gloves", "Ear Defenders", "Harness", "Respirator", "Face Shield",
];

const emptyStep = (): MethodStatementStep => ({
    id: generateId(), description: "", responsiblePerson: "", competencyRequired: "",
});

// Older records saved before this module became a dedicated Method
// Statement may be missing preparedBy/competencyRequired (they used to be
// called something else, or didn't exist) — coerce to safe defaults so
// editing an old record doesn't hand a `value={undefined}` to an input.
function normaliseStep(step: Partial<MethodStatementStep> & { id: string }): MethodStatementStep {
    return {
        id: step.id,
        description: step.description ?? "",
        responsiblePerson: step.responsiblePerson ?? "",
        competencyRequired: step.competencyRequired ?? "",
    };
}

export default function MethodStatementPage() {
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
        editItem,
        exportData,
        importData
    } = useModuleData<MethodStatement & { title: string }>({ module: "rams", storeKey: "rams" });
    const { isLimitReached } = useSubscription();
    const [showForm, setShowForm] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [steps, setSteps] = useState<MethodStatementStep[]>([emptyStep()]);
    const [form, setForm] = useState({
        taskTitle: "", projectName: "", location: "", preparedBy: "",
        taskDescription: "", ppeRequired: [] as string[], plantEquipment: "",
        emergencyProcedures: "", reviewDate: "",
    });
    const { showToast } = useToast();

    const togglePPE = (ppe: string) => {
        setForm({
            ...form,
            ppeRequired: form.ppeRequired.includes(ppe)
                ? form.ppeRequired.filter((p) => p !== ppe)
                : [...form.ppeRequired, ppe],
        });
    };

    const addStep = () => {
        setSteps([...steps, emptyStep()]);
    };

    const updateStep = (id: string, field: keyof MethodStatementStep, value: string) => {
        setSteps(steps.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    };

    const removeStep = (id: string) => {
        if (steps.length <= 1) return;
        setSteps(steps.filter((s) => s.id !== id));
    };

    const resetForm = () => {
        setSteps([emptyStep()]);
        setForm({
            taskTitle: "", projectName: "", location: "", preparedBy: "",
            taskDescription: "", ppeRequired: [], plantEquipment: "",
            emergencyProcedures: "", reviewDate: "",
        });
        setEditingId(null);
    };

    const handleSave = () => {
        if (!form.taskTitle.trim()) return;

        if (editingId) {
            const updatedItem: MethodStatement & { title: string } = {
                id: editingId,
                ...form,
                title: form.taskTitle,
                steps,
                createdAt: items.find((i) => i.id === editingId)?.createdAt ?? new Date().toISOString(),
            };
            editItem(editingId, updatedItem);
            showToast("Method statement updated");
            setShowForm(false);
            resetForm();
            return;
        }

        if (isLimitReached(totalRecords)) {
            setShowUpgradeModal(true);
            return;
        }

        const newItem: MethodStatement & { title: string } = {
            id: generateId(),
            ...form,
            title: form.taskTitle, // Map for search
            steps,
            createdAt: new Date().toISOString()
        };
        addItem(newItem);
        showToast("Method statement saved successfully!");
        setShowForm(false);
        resetForm();
    };

    const handleEdit = (item: MethodStatement & { title: string }) => {
        setForm({
            taskTitle: item.taskTitle, projectName: item.projectName, location: item.location,
            preparedBy: item.preparedBy ?? "", taskDescription: item.taskDescription,
            ppeRequired: item.ppeRequired ?? [], plantEquipment: item.plantEquipment,
            emergencyProcedures: item.emergencyProcedures, reviewDate: item.reviewDate,
        });
        setSteps(item.steps?.length ? item.steps.map(normaliseStep) : [emptyStep()]);
        setEditingId(item.id);
        setShowForm(true);
    };

    const handleDelete = (id: string) => {
        removeItem(id);
        showToast("Method statement deleted", "info");
    };

    const handleExportPDF = (item: MethodStatement) => {
        const pdf = new DutyDocsPDF();
        pdf.addHeader("Method Statement", `Ref: ${item.id.split("-")[0]}`);
        pdf.addSection("Task Details");
        pdf.addKeyValue("Task Title", item.taskTitle);
        pdf.addKeyValue("Project Name", item.projectName);
        pdf.addKeyValue("Location", item.location);
        pdf.addKeyValue("Prepared By", item.preparedBy);
        pdf.addKeyValue("Created", pdfDate(item.createdAt));
        pdf.addKeyValue("Review Date", pdfDate(item.reviewDate));
        pdf.addTextBlock("Task Description", item.taskDescription);
        pdf.addSection("Sequence of Work");
        pdf.addTable(
            ["Step", "Action", "Responsible", "Competency Required"],
            (item.steps ?? []).map((s, i) => [String(i + 1), s.description, s.responsiblePerson, s.competencyRequired]),
            [12, 60, 48, 50]
        );
        pdf.addSection("PPE, Plant & Equipment");
        pdf.addTagList("PPE Required", item.ppeRequired);
        pdf.addTextBlock("Plant, Equipment & Materials", item.plantEquipment);
        pdf.addSection("Emergency Procedures");
        pdf.addTextBlock("Procedures", item.emergencyProcedures);
        const slug = item.taskTitle.toLowerCase().replace(/\s+/g, "-").slice(0, 30);
        pdf.save(`method-statement-${slug}.pdf`);
    };

    if (showForm) {
        return (
            <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-2xl mx-auto">
                <button onClick={() => { setShowForm(false); resetForm(); }} className="btn btn-ghost mb-4" style={{ padding: "0.5rem 0" }}>
                    <ArrowLeft size={18} /> Back
                </button>
                <h1 className="text-xl font-bold mb-6" style={{ color: "var(--color-text-primary)" }}>
                    {editingId ? "Edit Method Statement" : "New Method Statement"}
                </h1>

                <div className="space-y-4">
                    <div>
                        <label className="input-label">Task Title *</label>
                        <input className="input-field" placeholder="e.g. Scaffolding Erection" value={form.taskTitle} onChange={(e) => setForm({ ...form, taskTitle: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="input-label">Project Name</label>
                            <input className="input-field" placeholder="Project" value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} />
                        </div>
                        <div>
                            <label className="input-label">Location</label>
                            <input className="input-field" placeholder="Site location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Task Description</label>
                        <textarea className="input-field" placeholder="Describe the overall task/activity..." value={form.taskDescription} onChange={(e) => setForm({ ...form, taskDescription: e.target.value })} />
                    </div>

                    {/* Sequence of Work */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="input-label" style={{ margin: 0 }}>Sequence of Work</label>
                            <button onClick={addStep} className="btn btn-ghost" style={{ padding: "0.25rem 0.5rem", fontSize: "12px" }}>
                                <Plus size={14} /> Add Step
                            </button>
                        </div>
                        <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
                            The order the work happens in — what to do, who does it, what they need to be competent to do it.
                        </p>
                        <div className="space-y-3">
                            {steps.map((step, idx) => (
                                <div key={step.id} className="card" style={{ background: "var(--color-bg-secondary)" }}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold" style={{ color: "var(--color-safety-blue)" }}>Step {idx + 1}</span>
                                        {steps.length > 1 && (
                                            <button onClick={() => removeStep(step.id)} className="btn btn-ghost" style={{ padding: "0.25rem", color: "var(--color-safety-red)" }}>
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <input className="input-field" placeholder="What happens in this step" value={step.description} onChange={(e) => updateStep(step.id, "description", e.target.value)} />
                                        <input className="input-field" placeholder="Who's responsible (name/trade)" value={step.responsiblePerson} onChange={(e) => updateStep(step.id, "responsiblePerson", e.target.value)} />
                                        <input className="input-field" placeholder="Competency required (e.g. CSCS card, banksman trained)" value={step.competencyRequired} onChange={(e) => updateStep(step.id, "competencyRequired", e.target.value)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PPE */}
                    <div>
                        <label className="input-label">PPE Required</label>
                        <div className="flex flex-wrap gap-2">
                            {PPE_LIST.map((ppe) => (
                                <button
                                    key={ppe}
                                    type="button"
                                    onClick={() => togglePPE(ppe)}
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
                        <label className="input-label">Plant, Equipment & Materials</label>
                        <textarea className="input-field" placeholder="List plant, equipment and materials needed..." value={form.plantEquipment} onChange={(e) => setForm({ ...form, plantEquipment: e.target.value })} />
                    </div>

                    <div>
                        <label className="input-label">Emergency Procedures</label>
                        <textarea className="input-field" placeholder="What to do if something goes wrong..." value={form.emergencyProcedures} onChange={(e) => setForm({ ...form, emergencyProcedures: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="input-label">Prepared By</label>
                            <input className="input-field" placeholder="Your name" value={form.preparedBy} onChange={(e) => setForm({ ...form, preparedBy: e.target.value })} />
                        </div>
                        <div>
                            <label className="input-label">Review Date</label>
                            <input type="date" className="input-field" value={form.reviewDate} onChange={(e) => setForm({ ...form, reviewDate: e.target.value })} />
                        </div>
                    </div>

                    <button onClick={handleSave} className="btn btn-primary btn-full mt-4">
                        {editingId ? "Save Changes" : "Save Method Statement"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>Method Statements</h1>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{items.length} method statement{items.length !== 1 ? "s" : ""}</p>
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
                placeholder="Search method statements..."
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

            {loading ? (
                <div className="space-y-3">
                    <RecordSkeleton />
                    <RecordSkeleton />
                    <RecordSkeleton />
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="empty-state">
                    <FileText size={40} style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
                        {searchTerm || statusFilter !== "all" ? "No matching records found" : "No method statements yet"}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                        {searchTerm || statusFilter !== "all" ? "Try adjusting your filters" : "Create a step-by-step method statement for a safe system of work"}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredItems.map((item, i) => (
                        <div key={item.id} className="card card-compact stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(59,130,246,0.1)" }}>
                                    <FileText size={16} style={{ color: "var(--color-safety-blue)" }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{item.taskTitle}</p>
                                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                        {(item.steps ?? []).length} step{(item.steps ?? []).length !== 1 ? "s" : ""}
                                        {item.location && ` · ${item.location}`} · {formatDate(item.createdAt)}
                                    </p>
                                </div>
                                <button onClick={() => handleEdit(item)} className="btn btn-ghost" style={{ padding: "0.5rem", color: "var(--color-text-secondary)" }} title="Edit">
                                    <Pencil size={16} />
                                </button>
                                <button onClick={() => handleExportPDF(item)} className="btn btn-ghost" style={{ padding: "0.5rem", color: "var(--color-accent)" }} title="Export PDF">
                                    <FileDown size={16} />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="btn btn-ghost" style={{ padding: "0.5rem", color: "var(--color-safety-red)" }} title="Delete">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                title="Record Limit Reached"
                description={`You've reached the 50 record limit on the Starter plan. Upgrade to Pro to create unlimited health and safety documents.`}
            />
        </div>
    );
}
