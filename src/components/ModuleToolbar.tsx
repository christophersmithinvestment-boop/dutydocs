import React, { useRef } from "react";
import { Search, Filter, X, Download, Upload } from "lucide-react";

interface ModuleToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusChange: (value: string) => void;
    placeholder?: string;
    onExport?: () => void;
    onImport?: (file: File) => void;
}

export function ModuleToolbar({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusChange,
    placeholder = "Search records...",
    onExport,
    onImport,
}: ModuleToolbarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onImport) {
            onImport(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-in slide-in-from-top-2 duration-300">
            {/* Search Input */}
            <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    <Search size={16} style={{ color: "var(--color-text-muted)" }} />
                </div>
                <input
                    type="text"
                    className="input-field pl-10 pr-10 w-full"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={{
                        background: "var(--color-bg-secondary)",
                        borderColor: "var(--color-border)",
                    }}
                />
                {searchTerm && (
                    <button
                        onClick={() => onSearchChange("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        style={{ color: "var(--color-text-muted)" }}
                        aria-label="Clear search"
                        title="Clear search"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Status Filter */}
            <div className="relative min-w-[140px]">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    <Filter size={14} style={{ color: "var(--color-text-muted)" }} />
                </div>
                <select
                    className="input-field pl-9 w-full appearance-none"
                    value={statusFilter}
                    onChange={(e) => onStatusChange(e.target.value)}
                    style={{
                        background: "var(--color-bg-secondary)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                </select>
            </div>

            {/* Export / Import */}
            {(onExport || onImport) && (
                <div className="flex items-center gap-2">
                    {onExport && (
                        <button
                            onClick={onExport}
                            className="btn btn-secondary flex items-center gap-2 h-full"
                            title="Export to CSV"
                            aria-label="Export to CSV"
                        >
                            <Download size={16} />
                            <span className="hidden sm:inline">Export</span>
                        </button>
                    )}
                    {onImport && (
                        <>
                            <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="btn btn-secondary flex items-center gap-2 h-full"
                                title="Import from CSV"
                                aria-label="Import from CSV"
                            >
                                <Upload size={16} />
                                <span className="hidden sm:inline">Import</span>
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
