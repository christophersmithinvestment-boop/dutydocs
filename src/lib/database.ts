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

    // Throws rather than returning [] — an empty array here is
    // indistinguishable from a module the user hasn't used yet.
    if (error) {
        console.error(`[DutyDocs] Failed to load ${module}:`, error.message);
        throw new Error(error.message);
    }

    return (data || []).map((row) => ({
        ...row.data,
        _db_id: row.id, // keep the DB row ID for updates/deletes
    })) as T[];
}

// ─── Save a new record ────────────────────────────────────────────
// Throws on failure so callers can surface it — a save that silently
// no-ops shows the record on screen but never persists it.
export async function saveRecord<T extends { id: string }>(
    module: string,
    record: T
): Promise<boolean> {
    const userId = await getUserId();
    if (!userId) throw new Error("You appear to be signed out. Sign in and try again.");

    const { error } = await supabase.from("records").insert({
        user_id: userId,
        module,
        data: record,
    });

    if (error) {
        console.error(`[DutyDocs] Failed to save ${module}:`, error.message);
        throw new Error(error.message);
    }
    return true;
}

// ─── Delete a record by its data.id ───────────────────────────────
// Throws on failure so callers can surface it — a delete that silently
// no-ops leaves the row on screen removed but still in the database.
export async function deleteRecord(module: string, recordId: string): Promise<boolean> {
    const userId = await getUserId();
    if (!userId) throw new Error("You appear to be signed out. Sign in and try again.");

    // Find the DB row that contains this record ID
    const { data: rows, error: lookupError } = await supabase
        .from("records")
        .select("id, data")
        .eq("user_id", userId)
        .eq("module", module);

    if (lookupError) {
        console.error(`[DutyDocs] Failed to look up ${module} record:`, lookupError.message);
        throw new Error(lookupError.message);
    }

    const row = (rows || []).find((r) => r.data?.id === recordId);
    if (!row) throw new Error("That record no longer exists.");

    const { error } = await supabase.from("records").delete().eq("id", row.id);

    if (error) {
        console.error(`[DutyDocs] Failed to delete:`, error.message);
        throw new Error(error.message);
    }
    return true;
}

// ─── Save several records in one insert ───────────────────────────
export async function saveRecords<T extends { id: string }>(
    module: string,
    records: T[]
): Promise<boolean> {
    if (!records.length) return true;
    const userId = await getUserId();
    if (!userId) throw new Error("You appear to be signed out. Sign in and try again.");

    const { error } = await supabase.from("records").insert(
        records.map((record) => ({ user_id: userId, module, data: record }))
    );

    if (error) {
        console.error(`[DutyDocs] Failed to save ${module} batch:`, error.message);
        throw new Error(error.message);
    }
    return true;
}

// ─── Delete every record on the account ───────────────────────────
// Used by Settings → Clear All Data. RLS scopes deletes to the signed-in
// user, and the explicit user_id filter keeps that true client-side too.
// Returns how many rows were removed; throws on failure.
export async function deleteAllRecords(): Promise<number> {
    const userId = await getUserId();
    if (!userId) throw new Error("You appear to be signed out. Sign in and try again.");

    const { count, error } = await supabase
        .from("records")
        .delete({ count: "exact" })
        .eq("user_id", userId);

    if (error) {
        console.error("[DutyDocs] Failed to clear all records:", error.message);
        throw new Error(error.message);
    }
    return count ?? 0;
}

// ─── Update a record (for status changes, permits, etc.) ──────────
// Throws on failure, as saveRecord/deleteRecord do.
export async function updateRecord<T extends { id: string }>(
    module: string,
    recordId: string,
    updatedData: T
): Promise<boolean> {
    const userId = await getUserId();
    if (!userId) throw new Error("You appear to be signed out. Sign in and try again.");

    const { data: rows, error: lookupError } = await supabase
        .from("records")
        .select("id, data")
        .eq("user_id", userId)
        .eq("module", module);

    if (lookupError) {
        console.error(`[DutyDocs] Failed to look up ${module} record:`, lookupError.message);
        throw new Error(lookupError.message);
    }

    const row = (rows || []).find((r) => r.data?.id === recordId);
    if (!row) throw new Error("That record no longer exists.");

    const { error } = await supabase
        .from("records")
        .update({ data: updatedData })
        .eq("id", row.id);

    if (error) {
        console.error(`[DutyDocs] Failed to update:`, error.message);
        throw new Error(error.message);
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

// ─── Load every record for the user, grouped by module ────────────
// One query instead of one per module — used by the dashboard, which
// needs counts/recent-activity across all modules at once.
export async function loadAllModuleRecords(): Promise<Record<string, Record<string, unknown>[]>> {
    const userId = await getUserId();
    if (!userId) return {};

    const { data, error } = await supabase
        .from("records")
        .select("module, data")
        .eq("user_id", userId);

    // Throws rather than returning {} — that made the dashboard render
    // every stat as zero, which reads as "no data" not "load failed".
    if (error) {
        console.error("[DutyDocs] Failed to load all records:", error.message);
        throw new Error(error.message);
    }

    const grouped: Record<string, Record<string, unknown>[]> = {};
    for (const row of data || []) {
        (grouped[row.module] ??= []).push(row.data as Record<string, unknown>);
    }
    return grouped;
}

// ─── Get total count of all records across all modules ───────────────
export async function getTotalRecordCount(): Promise<number> {
    const userId = await getUserId();
    if (!userId) return 0;

    const { count, error } = await supabase
        .from("records")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);

    // Throws rather than returning 0 — a failed count would otherwise
    // render as "0/50 Records", understating real usage.
    if (error) {
        console.error("[DutyDocs] Failed to get total record count:", error.message);
        throw new Error(error.message);
    }

    return count || 0;
}
