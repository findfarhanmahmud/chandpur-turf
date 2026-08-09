import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const d = new Date();
d.setDate(d.getDate() + 12);
const testDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

let pass = 0, fail = 0;
function check(name, cond, extra = "") {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name} ${extra}`); }
}

async function cleanup() {
  const { data } = await sb.from("bookings").select("id").eq("booking_date", testDate).ilike("customer_name", "__verify%");
  const ids = (data ?? []).map((b) => b.id);
  if (ids.length) await sb.from("bookings").delete().in("id", ids);
}

console.log(`Test date: ${testDate}`);
await cleanup();

// Create confirmed booking, complete it
const m = await sb.rpc("create_manual_booking", {
  p_customer_name: "__verify complete",
  p_phone_number: "01999999961",
  p_whatsapp_number: "01999999961",
  p_booking_date: testDate,
  p_slot_ids: ["n-2130"],
});
check("manual booking created", m.error === null, m.error?.message);
await sb.from("bookings").update({ status: "completed" }).eq("id", m.data?.id);

{
  const { data: avail } = await sb.rpc("get_day_availability", { p_date: testDate });
  const s = (avail ?? []).find((r) => r.slot_id === "n-2130")?.status;
  check("completed slot now reported 'booked' (migration applied)", s === "booked", `got ${s}`);
}

// Double-book still rejected
{
  const m2 = await sb.rpc("create_manual_booking", {
    p_customer_name: "__verify other",
    p_phone_number: "01999999962",
    p_whatsapp_number: "01999999962",
    p_booking_date: testDate,
    p_slot_ids: ["n-2130"],
  });
  check("re-book still rejected (concurrency protection intact)", m2.error !== null && String(m2.error.message).includes("SLOT_UNAVAILABLE"), m2.error?.message ?? "none");
}

// Cancel still releases
{
  const c = await sb.rpc("create_manual_booking", {
    p_customer_name: "__verify cancel",
    p_phone_number: "01999999963",
    p_whatsapp_number: "01999999963",
    p_booking_date: testDate,
    p_slot_ids: ["d-1100"],
  });
  await sb.from("bookings").update({ status: "cancelled" }).eq("id", c.data?.id);
  const { data: avail } = await sb.rpc("get_day_availability", { p_date: testDate });
  const s = (avail ?? []).find((r) => r.slot_id === "d-1100")?.status;
  check("cancelled slot still released -> available", s === "available", `got ${s}`);
}

await cleanup();
console.log(`\n===== RESULT: ${pass} passed, ${fail} failed =====\n`);
process.exit(fail > 0 ? 1 : 0);
