import { supabase, isSupabaseConfigured } from "./supabase";

// ─── Get current user ID ──────────────────────────────────────────
async function getUserId(): Promise<string | null> {
    if (!isSupabaseConfigured) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
}

// ─── Load records for a module ────────────────────────────────────
export async function loadRecords<T>(module: string): Promise<T[]> {
    const userId = await getUserId();
    if (!userId) return [];

    const { data, error } = await supabase
        .from("records")
        .select("*")
        .eq("user_id", userId)
        .eq("module", module)
        .order("created_at", { ascending: false });

    if (error) {
        console.error(`[DutyDocs] Failed to load ${module}:`, error.message);
        return [];
    }

    return (data || []).map((row) => ({
        ...row.data,
        _db_id: row.id, // keep the DB row ID for updates/deletes
    })) as T[];
}

// ─── Save a new record ────────────────────────────────────────────
export async function saveRecord<T extends { id: string }>(
    module: string,
    record: T
): Promise<boolean> {
    const userId = await getUserId();
    if (!userId) return false;

    const { error } = await supabase.from("records").insert({
        user_id: userId,
        module,
        data: record,
    });

    if (error) {
        console.error(`[DutyDocs] Failed to save ${module}:`, error.message);
        return false;
    }
    return true;
}

// ─── Delete a record by its data.id ───────────────────────────────
export async function deleteRecord(module: string, recordId: string): Promise<boolean> {
    const userId = await getUserId();
    if (!userId) return false;

    // Find the DB row that contains this record ID
    const { data: rows } = await supabase
        .from("records")
        .select("id, data")
        .eq("user_id", userId)
        .eq("module", module);

    const row = (rows || []).find((r) => r.data?.id === recordId);
    if (!row) return false;

    const { error } = await supabase.from("records").delete().eq("id", row.id);

    if (error) {
        console.error(`[DutyDocs] Failed to delete:`, error.message);
        return false;
    }
    return true;
}

// ─── Update a record (for status changes, permits, etc.) ──────────
export async function updateRecord<T extends { id: string }>(
    module: string,
    recordId: string,
    updatedData: T
): Promise<boolean> {
    const userId = await getUserId();
    if (!userId) return false;

    const { data: rows } = await supabase
        .from("records")
        .select("id, data")
        .eq("user_id", userId)
        .eq("module", module);

    const row = (rows || []).find((r) => r.data?.id === recordId);
    if (!row) return false;

    const { error } = await supabase
        .from("records")
        .update({ data: updatedData })
        .eq("id", row.id);

    if (error) {
        console.error(`[DutyDocs] Failed to update:`, error.message);
        return false;
    }
    return true;
}

// ─── Batch save (for initial migration from localStorage) ─────────
export async function migrateFromLocalStorage(module: string, storeKey: string): Promise<number> {
    if (typeof window === "undefined") return 0;

    const raw = localStorage.getItem(`hs_${storeKey}`);
    if (!raw) return 0;

    try {
        const items = JSON.parse(raw) as Array<{ id: string }>;
        if (!items.length) return 0;

        const userId = await getUserId();
        if (!userId) return 0;

        // Check if user already has records for this module
        const { count } = await supabase
            .from("records")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("module", module);

        if (count && count > 0) return 0; // Already migrated

        const rows = items.map((item) => ({
            user_id: userId,
            module,
            data: item,
        }));

        const { error } = await supabase.from("records").insert(rows);
        if (error) {
            console.error(`[DutyDocs] Migration failed for ${module}:`, error.message);
            return 0;
        }

        return items.length;
    } catch {
        return 0;
    }
}

// ─── Get total count of all records across all modules ───────────────
export async function getTotalRecordCount(): Promise<number> {
    const userId = await getUserId();
    if (!userId) return 0;

    const { count, error } = await supabase
        .from("records")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);

    if (error) {
        console.error("[DutyDocs] Failed to get total record count:", error.message);
        return 0;
    }

    return count || 0;
}
