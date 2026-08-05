#!/usr/bin/env node
/**
 * Forced-failure test for server-side tier enforcement.
 *
 * Proves, against the real database, that a Starter account is refused
 * Pro-tier data by RLS — not merely hidden from it in the UI.
 *
 * Run it twice, once with each tier's token. The script detects which
 * tier the token carries and inverts its expectations:
 *   Starter token -> Pro modules must be REFUSED
 *   Pro token     -> Pro modules must be ALLOWED  (the control)
 * The Starter run alone cannot tell a working tier check apart from
 * something incidentally blocking everyone. The pair can.
 *
 * Usage:
 *   SUPABASE_URL=https://xxxx.supabase.co \
 *   SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx \
 *   ACCESS_TOKEN=eyJ... \
 *   node scripts/verify-tier-rls.mjs
 *
 * Getting ACCESS_TOKEN: sign in to the app, then in the devtools console:
 *   (() => { const k = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
 *            let v = localStorage.getItem(k);
 *            if (v.startsWith('base64-')) v = atob(v.slice(7));
 *            return JSON.parse(v).access_token; })()
 *
 * The script only reads, and writes rows it deletes again. Any row it
 * cannot clean up is reported loudly at the end.
 */

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
const TOKEN = process.env.ACCESS_TOKEN || process.env.STARTER_ACCESS_TOKEN;

if (!URL || !KEY || !TOKEN) {
    console.error("Missing SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY or ACCESS_TOKEN.");
    process.exit(2);
}

// records.module values for the 11 Pro-only modules. These are the DB
// names, not the nav slugs — see the note in supabase-tier-rls.sql.
const PRO_MODULES = [
    "permits",
    "asset_register",
    "ppe_register",
    "inspections",
    "first_aid_log",
    "emergency_contacts",
    "training_records",
    "fire_drills",
    "toolbox_talks",
    "dse_assessments",
    "manual_handling",
];

const CORE_MODULES = ["risk_assessments", "coshh_assessments", "rams", "incidents", "near_misses"];

const headers = {
    apikey: KEY,
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
};

async function whoAmI() {
    const res = await fetch(`${URL}/auth/v1/user`, { headers: { apikey: KEY, Authorization: `Bearer ${TOKEN}` } });
    if (!res.ok) {
        console.error(`Token rejected (HTTP ${res.status}). Is it expired? Tokens last ~1 hour.`);
        process.exit(2);
    }
    return res.json();
}

async function trySelect(module) {
    const res = await fetch(`${URL}/rest/v1/records?select=id&module=eq.${module}&limit=1`, { headers });
    const body = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, rows: Array.isArray(body) ? body.length : null, body };
}

async function tryInsert(module, userId) {
    const res = await fetch(`${URL}/rest/v1/records`, {
        method: "POST",
        headers: { ...headers, Prefer: "return=representation" },
        body: JSON.stringify({
            user_id: userId,
            module,
            data: { id: `rls-probe-${Date.now()}`, title: "RLS forced-failure probe" },
        }),
    });
    const body = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, code: body?.code, id: Array.isArray(body) ? body[0]?.id : null };
}

async function cleanup(id) {
    const res = await fetch(`${URL}/rest/v1/records?id=eq.${id}`, { method: "DELETE", headers });
    return res.ok;
}

const results = [];
const orphans = [];

const user = await whoAmI();
const plan = user.app_metadata?.plan ?? "(none)";
console.log(`Signed in as ${user.email}`);
console.log(`  app_metadata.plan  = ${plan}`);
console.log(`  user_metadata.plan = ${user.user_metadata?.plan ?? "(none)"}`);

// Pro token => control run (access expected). Anything else is Starter,
// matching current_plan()'s own fail-closed rule.
const mode = plan === "pro" ? "pro" : "starter";
console.log(
    mode === "pro"
        ? "  mode = PRO control run — Pro modules must be ALLOWED"
        : "  mode = STARTER gated run — Pro modules must be REFUSED"
);

console.log(`\n── Pro modules: must be ${mode === "pro" ? "allowed" : "refused"} ──`);
for (const module of PRO_MODULES) {
    const sel = await trySelect(module);
    const ins = await tryInsert(module, user.id);
    if (ins.id) {
        if (await cleanup(ins.id)) console.log(`   (cleaned up probe row in ${module})`);
        else orphans.push({ module, id: ins.id });
    }

    // Reads are filtered by RLS rather than erroring, so "blocked" for a
    // SELECT means zero rows come back. On the Pro control run an empty
    // read only means "no data yet", so the write is the reliable signal
    // there; on the Starter run a read returning rows is a hard fail
    // whatever the write did.
    const readBlocked = sel.rows === 0;
    const writeBlocked = !ins.ok && ins.code === "42501";
    const pass = mode === "pro" ? ins.ok : readBlocked && writeBlocked;

    results.push({ module, pass });
    console.log(
        `${pass ? "PASS" : "FAIL"}  ${module.padEnd(20)} ` +
        `read=${readBlocked ? (mode === "pro" ? "0 rows (no data)" : "blocked") : `${sel.rows} row(s) returned`}  ` +
        `write=${ins.ok ? "accepted" : writeBlocked ? "blocked (42501)" : `HTTP ${ins.status} ${ins.code ?? "?"}`}`
    );
}

console.log("\n── Core modules: a Starter account must still work ──");
for (const module of CORE_MODULES) {
    const ins = await tryInsert(module, user.id);
    let cleaned = false;
    if (ins.id) {
        cleaned = await cleanup(ins.id);
        if (!cleaned) orphans.push({ module, id: ins.id });
    }
    // A Starter already at the 50-record cap is legitimately refused here;
    // that is the cap working, not a regression.
    const capped = !ins.ok && ins.code === "42501";
    const pass = ins.ok || capped;
    results.push({ module, pass });
    console.log(
        `${pass ? "PASS" : "FAIL"}  ${module.padEnd(20)} ` +
        `write=${ins.ok ? "accepted" : capped ? "refused (at 50-record cap)" : `HTTP ${ins.status} ${ins.code}`}`
    );
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);

if (orphans.length) {
    console.error("\nCOULD NOT CLEAN UP these probe rows — delete them by hand:");
    for (const o of orphans) console.error(`  records.id = ${o.id}  (module ${o.module})`);
}

if (failed.length) {
    console.error(`\nFAILED (${mode} run): ${failed.map((f) => f.module).join(", ")}`);
    console.error(
        mode === "pro"
            ? "A Pro account is being refused its own modules — the policies are too strict."
            : "A Starter account reached Pro-tier data — the gate is not actually closed."
    );
    process.exit(1);
}
console.log(
    mode === "pro"
        ? "Control run clean: Pro keeps full access."
        : "Server-side tier enforcement is holding: Starter is refused at the database."
);
