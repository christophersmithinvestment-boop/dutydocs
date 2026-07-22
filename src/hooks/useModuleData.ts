"use client";

import { useState, useEffect, useCallback } from "react";
import { loadRecords, saveRecord, deleteRecord, updateRecord, migrateFromLocalStorage } from "@/lib/database";
import { loadFromStore, saveToStore } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase";
import { exportToCSV, importFromCSV } from "@/lib/csv";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useUsage } from "@/components/UsageProvider";

interface UseModuleDataOptions {
    module: string;       // Supabase module name (e.g. "risk_assessments")
    storeKey: string;     // localStorage key (e.g. "risk_assessments")
    /**
     * Singular, lower-case name for one record, used in the delete
     * confirmation ("Delete this DSE assessment?"). Defaults to "record".
     */
    entityLabel?: string;
}

export function useModuleData<T extends { id: string; title?: string; status?: string }>(options: UseModuleDataOptions) {
    const { module, storeKey, entityLabel = "record" } = options;
    const confirm = useConfirm();
    const { showToast } = useToast();
    // Account-wide usage is shared app state, not per-instance — see UsageProvider.
    const { totalRecords, refreshUsage, adjustUsage } = useUsage();
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // ─── Filtered Items ──────────────────────────────────────────────
    const filteredItems = items.filter((item) => {
        const matchesSearch = !searchTerm ||
            (item.title?.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === "all" || item.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // ─── Load data ──────────────────────────────────────────────────
    const refreshData = useCallback(async () => {
        if (isSupabaseConfigured) {
            // Try migrating localStorage data first (one-time)
            await migrateFromLocalStorage(module, storeKey);
            const records = await loadRecords<T>(module);
            setItems(records);
        } else {
            // Fallback to localStorage
            setItems(loadFromStore<T[]>(storeKey, []));
        }
        // Migration can change the account-wide total, so re-read it.
        await refreshUsage();
        setLoading(false);
    }, [module, storeKey, refreshUsage]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    // ─── Add a new record ──────────────────────────────────────────
    // Resolves false if the record could not be persisted, so callers can
    // keep the form open instead of reporting a save that never happened.
    const addItem = useCallback(async (item: T): Promise<boolean> => {
        const previousItems = items;
        const updated = [item, ...items];
        setItems(updated);

        try {
            if (isSupabaseConfigured) {
                await saveRecord(module, item);
            } else {
                saveToStore(storeKey, updated);
            }
            adjustUsage(1);
            return true;
        } catch (error) {
            setItems(previousItems);
            const message = error instanceof Error ? error.message : "Please try again.";
            console.error(`[DutyDocs] Save failed for ${module}:`, error);
            showToast(`Couldn't save: ${message}`, "error");
            return false;
        }
    }, [items, module, storeKey, showToast, adjustUsage]);

    // ─── Delete a record ──────────────────────────────────────────
    const removeItem = useCallback(async (id: string) => {
        const confirmed = await confirm({
            title: `Delete this ${entityLabel}?`,
            message: "This can't be undone.",
            confirmLabel: "Delete",
        });
        if (!confirmed) return;

        // Optimistic removal, rolled back if the delete fails.
        const previousItems = items;
        const updated = items.filter((i) => i.id !== id);
        setItems(updated);

        try {
            if (isSupabaseConfigured) {
                await deleteRecord(module, id);
            } else {
                saveToStore(storeKey, updated);
            }
            adjustUsage(-1);
            showToast(`${entityLabel[0].toUpperCase()}${entityLabel.slice(1)} deleted`, "success");
        } catch (error) {
            setItems(previousItems);
            const message = error instanceof Error ? error.message : "Please try again.";
            console.error(`[DutyDocs] Delete failed for ${module}:`, error);
            showToast(`Couldn't delete: ${message}`, "error");
        }
    }, [items, module, storeKey, entityLabel, confirm, showToast, adjustUsage]);

    // ─── Update a record ──────────────────────────────────────────
    // Resolves false if the change could not be persisted; the previous
    // version is restored so the list never shows an unsaved edit.
    const editItem = useCallback(async (id: string, updatedItem: T): Promise<boolean> => {
        const previousItems = items;
        const updated = items.map((i) => (i.id === id ? updatedItem : i));
        setItems(updated);

        try {
            if (isSupabaseConfigured) {
                await updateRecord(module, id, updatedItem);
            } else {
                saveToStore(storeKey, updated);
            }
            return true;
        } catch (error) {
            setItems(previousItems);
            const message = error instanceof Error ? error.message : "Please try again.";
            console.error(`[DutyDocs] Update failed for ${module}:`, error);
            showToast(`Couldn't save changes: ${message}`, "error");
            return false;
        }
    }, [items, module, storeKey, showToast]);

    // ─── Bulk set (for complex operations) ─────────────────────────
    const setAllItems = useCallback((newItems: T[]) => {
        const previousItems = items;
        setItems(newItems);
        if (!isSupabaseConfigured) {
            try {
                saveToStore(storeKey, newItems);
            } catch (error) {
                setItems(previousItems);
                const message = error instanceof Error ? error.message : "Please try again.";
                console.error(`[DutyDocs] Bulk save failed for ${module}:`, error);
                showToast(`Couldn't save: ${message}`, "error");
            }
        }
    }, [items, module, storeKey, showToast]);

    // ─── Export and Import ──────────────────────────────────────────
    const exportData = useCallback(() => {
        exportToCSV(items, `${module}_export`);
    }, [items, module]);

    const importData = useCallback(async (file: File) => {
        try {
            const parsed = await importFromCSV(file) as T[];
            if (parsed && parsed.length > 0) {
                // Combine existing and new items, preserving new ones or appending
                // For simplicity, we'll append and assume new IDs or override
                // Better approach: filter duplicates if IDs exist
                const existingMap = new Map(items.map(i => [i.id, i]));
                parsed.forEach(p => existingMap.set(p.id, p));

                const combined = Array.from(existingMap.values());
                setAllItems(combined);
                // Import changes how many records the account holds; re-read
                // rather than assuming this module's count is the total.
                await refreshUsage();
                return true;
            }
            return false;
        } catch (error) {
            console.error("Import failed:", error);
            throw error;
        }
    }, [items, setAllItems, refreshUsage]);

    return {
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
        setAllItems,
        refreshData,
        exportData,
        importData
    };
}
