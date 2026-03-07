"use client";

import { useState, useEffect, useCallback } from "react";
import { loadRecords, saveRecord, deleteRecord, updateRecord, migrateFromLocalStorage, getTotalRecordCount } from "@/lib/database";
import { loadFromStore, saveToStore, isClient } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase";
import { exportToCSV, importFromCSV } from "@/lib/csv";

interface UseModuleDataOptions {
    module: string;       // Supabase module name (e.g. "risk_assessments")
    storeKey: string;     // localStorage key (e.g. "risk_assessments")
}

export function useModuleData<T extends { id: string; title?: string; status?: string }>(options: UseModuleDataOptions) {
    const { module, storeKey } = options;
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
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
            const count = await getTotalRecordCount();
            setTotalRecords(count);
        } else {
            // Fallback to localStorage
            const localItems = loadFromStore<T[]>(storeKey, []);
            setItems(localItems);

            // For local storage, calc total count across all known modules
            if (isClient()) {
                let count = 0;
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith("hs_")) {
                        try {
                            const data = JSON.parse(localStorage.getItem(key) || "[]");
                            if (Array.isArray(data)) count += data.length;
                        } catch { }
                    }
                });
                setTotalRecords(count);
            }
        }
        setLoading(false);
    }, [module, storeKey]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    // ─── Add a new record ──────────────────────────────────────────
    const addItem = useCallback(async (item: T) => {
        const updated = [item, ...items];
        setItems(updated);
        setTotalRecords(prev => prev + 1);

        if (isSupabaseConfigured) {
            await saveRecord(module, item);
        } else {
            saveToStore(storeKey, updated);
        }
    }, [items, module, storeKey]);

    // ─── Delete a record ──────────────────────────────────────────
    const removeItem = useCallback(async (id: string) => {
        const updated = items.filter((i) => i.id !== id);
        setItems(updated);
        setTotalRecords(prev => Math.max(0, prev - 1));

        if (isSupabaseConfigured) {
            await deleteRecord(module, id);
        } else {
            saveToStore(storeKey, updated);
        }
    }, [items, module, storeKey]);

    // ─── Update a record ──────────────────────────────────────────
    const editItem = useCallback(async (id: string, updatedItem: T) => {
        const updated = items.map((i) => (i.id === id ? updatedItem : i));
        setItems(updated);

        if (isSupabaseConfigured) {
            await updateRecord(module, id, updatedItem);
        } else {
            saveToStore(storeKey, updated);
        }
    }, [items, module, storeKey]);

    // ─── Bulk set (for complex operations) ─────────────────────────
    const setAllItems = useCallback((newItems: T[]) => {
        setItems(newItems);
        if (!isSupabaseConfigured) {
            saveToStore(storeKey, newItems);
        }
    }, [storeKey]);

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
                setTotalRecords(combined.length);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Import failed:", error);
            throw error;
        }
    }, [items, setAllItems]);

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
