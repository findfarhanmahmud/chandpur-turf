import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const d = new Date();
d.setDate(d.getDate() + 15);
const testDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

let pass = 0, fail = 0;
function check(name, cond, extra = "") {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name} ${extra}`); }
}

async function cleanup() {
  const { data } = await sb.from("bookings").select("id").eq("booking_date", testDate).ilike("customer_name", "__x%");
  const ids = (data ?? []).map((b) => b.id);
  if (ids.length) await sb.from("bookings").delete().in("id", ids);
}

console.log(`Test date: ${testDate}`);
await cleanup();

// A. Pending booking does NOT block a manual booking
{
  const p = await sb.rpc("create_booking", {
    p_customer_name: "__x pending",
    p_phone_number: "01999999980",
    p_whatsapp_number: "01999999980",
    p_booking_date: testDate,
    p_slot_ids: ["d-0500"],
  });
  check("pending created", p.error === null, p.error?.message);

  const { data: bs } = await sb.from("booking_slots").select("slot_id,is_released").eq("booking_id", p.data?.id);
  check("pending slot row is_released=true", (bs ?? []).every((r) => r.is_released === true), JSON.stringify(bs));

  const m = await sb.rpc("create_manual_booking", {
    p_customer_name: "__x manual on pending",
    p_phone_number: "01999999981",
    p_whatsapp_number: "01999999981",
    p_booking_date: testDate,
    p_slot_ids: ["d-0500"],
  });
  check("manual booking on pending slot SUCCEEDS (pending does not lock)", m.error === null, m.error?.message);
}

// B. Cancelled booking releases its slot -> manual re-book works
{
  const c = await sb.rpc("create_manual_booking", {
    p_customer_name: "__x cancel me",
    p_phone_number: "01999999982",
    p_whatsapp_number: "01999999982",
    p_booking_date: testDate,
    p_slot_ids: ["d-0630"],
  });
  check("confirmed created", c.error === null, c.error?.message);
  const cancelId = c.data?.id;

  const cn = await sb.from("bookings").update({ status: "cancelled" }).eq("id", cancelId).select("status").single();
  check("cancelled ok", cn.error === null && cn.data?.status === "cancelled", cn.error?.message ?? "none");

  const { data: bsAfter } = await sb.from("booking_slots").select("slot_id,is_released").eq("booking_id", cancelId);
  check("cancelled slot rows is_released=true (trigger fired)", (bsAfter ?? []).every((r) => r.is_released === true), JSON.stringify(bsAfter));

  const m2 = await sb.rpc("create_manual_booking", {
    p_customer_name: "__x rebook after cancel",
    p_phone_number: "01999999983",
    p_whatsapp_number: "01999999983",
    p_booking_date: testDate,
    p_slot_ids: ["d-0630"],
  });
  check("manual re-book after cancel SUCCEEDS", m2.error === null, m2.error?.message);
}

// C. Completed booking -> slot STILL held -> manual booking FAILS (the bug path)
{
  const co = await sb.rpc("create_manual_booking", {
    p_customer_name: "__x complete me",
    p_phone_number: "01999999984",
    p_whatsapp_number: "01999999984",
    p_booking_date: testDate,
    p_slot_ids: ["d-0800"],
  });
  const coId = co.data?.id;
  const upd = await sb.from("bookings").update({ status: "completed" }).eq("id", coId).select("status").single();
  check("completed ok", upd.error === null, upd.error?.message);

  const { data: bsC } = await sb.from("booking_slots").select("slot_id,is_released").eq("booking_id", coId);
  check("completed slot NOT released", (bsC ?? []).every((r) => r.is_released === false), JSON.stringify(bsC));

  const m3 = await sb.rpc("create_manual_booking", {
    p_customer_name: "__x rebook after complete",
    p_phone_number: "01999999985",
    p_whatsapp_number: "01999999985",
    p_booking_date: testDate,
    p_slot_ids: ["d-0800"],
  });
  check("manual re-book after complete FAILS with SLOT_UNAVAILABLE (slot still locked)", m3.error !== null && String(m3.error.message).includes("SLOT_UNAVAILABLE"), m3.error?.message ?? "none");
  console.log("    -> this is EXACTLY the 'One or more slots were just booked' path");
}

await cleanup();
console.log(`\n===== RESULT: ${pass} passed, ${fail} failed =====\n`);
process.exit(fail > 0 ? 1 : 0);
