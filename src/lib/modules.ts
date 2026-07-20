// Canonical list of H&S module names, mirrored from the sidebar navigation
// (src/components/layout/Sidebar.tsx) and each module page's useModuleData
// call. Kept as a single shared source so features like bug reporting can
// reference "which module" without duplicating the list by hand.
export interface ModuleOption {
    value: string;
    label: string;
}

export const MODULES: ModuleOption[] = [
    { value: "risk_assessments", label: "Risk Assessment" },
    { value: "coshh_assessments", label: "COSHH" },
    { value: "rams", label: "Method Statement" },
    { value: "dse_assessments", label: "DSE Assessment" },
    { value: "manual_handling", label: "Manual Handling" },
    { value: "incidents", label: "Incident Report" },
    { value: "near_misses", label: "Near Miss" },
    { value: "first_aid_log", label: "First Aid Log" },
    { value: "inspections", label: "Site Inspection" },
    { value: "toolbox_talks", label: "Toolbox Talks" },
    { value: "permits", label: "Permits to Work" },
    { value: "fire_drills", label: "Fire Drills" },
    { value: "asset_register", label: "Asset Register" },
    { value: "ppe_register", label: "PPE Register" },
    { value: "training_records", label: "Training Records" },
    { value: "emergency_contacts", label: "Emergency Contacts" },
];
