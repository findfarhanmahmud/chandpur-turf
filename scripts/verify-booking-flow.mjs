import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// Load .env.local
const env = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing env vars");
  process.exit(1);
}

const sb = createClient(url, serviceKey, { auth: { persistSession: false } });

// Choose a far-future test date (YYYY-MM-DD)
const d = new Date();
d.setDate(d.getDate() + 10);
const testDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

let pass = 0;
let fail = 0;
function check(name, cond, extra = "") {
  if (cond) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    console.log(`  FAIL  ${name} ${extra}`);
  }
}

// Clean any leftover test rows for the date
async function cleanup() {
  const { data: testBookings } = await sb
    .from("bookings")
    .select("id")
    .eq("booking_date", testDate)
    .or("customer_name.eq.__test_flow__,customer_name.ilike.%__test%,customer_name.eq.probe");
  const ids = (testBookings ?? []).map((b) => b.id);
  if (ids.length > 0) {
    // Deleting the bookings cascades to their booking_slots rows.
    await sb.from("bookings").delete().in("id", ids);
  }
  await sb.from("blocked_slots").delete().eq("booking_date", testDate).like("reason", "__test%");
}

console.log(`\nTest date: ${testDate}\n`);

// 1. Verify RPCs exist
{
  console.log("== RPC availability ==");
  const r1 = await sb.rpc("confirm_booking", { p_booking_id: "00000000-0000-0000-0000-000000000000" });
  check("confirm_booking exists", r1.error === null || String(r1.error.message).includes("NOT_FOUND"), r1.error?.message);
  const r2 = await sb.rpc("create_manual_booking", {
    p_customer_name: "probe",
    p_phone_number: "01999999999",
    p_whatsapp_number: "01999999999",
    p_booking_date: testDate,
    p_slot_ids: ["d-1400"],
  });
  // Expect SLOT_UNAVAILABLE? No — expect either success or specific error. Probe only existence:
  check("create_manual_booking exists", r2.error === null || /NOT_FOUND|NAME_REQUIRED|INVALID_SLOTS|NO_SLOTS|PAST_/.test(r2.error?.message ?? ""), r2.error?.message);
  // The probe may have created a real confirmed booking if d-1400 was free.
  // Remove it immediately so it does not pollute the checks below.
  if (r2.error === null && r2.data?.id) {
    await sb.from("bookings").delete().eq("id", r2.data.id);
  }
}

await cleanup();

// 2. Pending booking does NOT lock slots
console.log("\n== Pending does not block ==");
{
  const { data: availBefore, error: avErr } = await sb.rpc("get_day_availability", { p_date: testDate });
  check("availability fetch", !avErr, avErr?.message);
  const statusBefore = (availBefore ?? []).find((r) => r.slot_id === "d-1400")?.status;
  check("d-1400 free before", statusBefore === "available", statusBefore);

  const b1 = await sb.rpc("create_booking", {
    p_customer_name: "__test_flow A",
    p_phone_number: "01999999991",
    p_whatsapp_number: "01999999991",
    p_booking_date: testDate,
    p_slot_ids: ["d-1400"],
  });
  check("create pending #1", b1.error === null && b1.data?.status === "pending", b1.error?.message);

  const b2 = await sb.rpc("create_booking", {
    p_customer_name: "__test_flow B",
    p_phone_number: "01999999992",
    p_whatsapp_number: "01999999992",
    p_booking_date: testDate,
    p_slot_ids: ["d-1400", "d-1530"],
  });
  check("second pending same slot allowed", b2.error === null && b2.data?.status === "pending", b2.error?.message);

  const { data: availMid } = await sb.rpc("get_day_availability", { p_date: testDate });
  const statusMid = (availMid ?? []).find((r) => r.slot_id === "d-1400")?.status;
  check("slot still available for customers (pending ignored)", statusMid === "available", statusMid);
}

// 3. Confirm & Block
console.log("\n== Confirm & Block ==");
{
  const { data: pendings } = await sb.from("bookings").select("id").eq("booking_date", testDate).eq("status", "pending").order("created_at", { ascending: true });
  const [p1, p2] = pendings ?? [];
  check("found 2 pending", (pendings ?? []).length === 2, `got ${(pendings ?? []).length}`);

  const c1 = await sb.rpc("confirm_booking", { p_booking_id: p1.id });
  check("confirm #1 ok", c1.error === null && c1.data?.status === "confirmed", c1.error?.message);

  const { data: availAfter } = await sb.rpc("get_day_availability", { p_date: testDate });
  const s1 = (availAfter ?? []).find((r) => r.slot_id === "d-1400")?.status;
  check("confirmed slot now booked", s1 === "booked", s1);

  const c2 = await sb.rpc("confirm_booking", { p_booking_id: p2.id });
  check("confirm #2 rejected (race protection)", c2.error !== null && String(c2.error.message).includes("SLOT_UNAVAILABLE"), c2.error?.message ?? "none");
}

// 4. Manual booking (BOOK & LOCK)
console.log("\n== Manual booking ==");
{
  const m1 = await sb.rpc("create_manual_booking", {
    p_customer_name: "__test_flow Manual",
    p_phone_number: "01999999993",
    p_whatsapp_number: "01999999993",
    p_booking_date: testDate,
    p_slot_ids: ["n-1830"],
  });
  check("manual booking created confirmed", m1.error === null && m1.data?.status === "confirmed", m1.error?.message);

  const m2 = await sb.rpc("create_manual_booking", {
    p_customer_name: "__test_flow Manual2",
    p_phone_number: "01999999994",
    p_whatsapp_number: "01999999994",
    p_booking_date: testDate,
    p_slot_ids: ["n-1830"],
  });
  check("manual double-book rejected", m2.error !== null && String(m2.error.message).includes("SLOT_UNAVAILABLE"), m2.error?.message ?? "none");

  const { data: availNight } = await sb.rpc("get_day_availability", { p_date: testDate });
  const n1 = (availNight ?? []).find((r) => r.slot_id === "n-1830")?.status;
  check("manually booked slot locked", n1 === "booked", n1);
}

// 5. Blocking
console.log("\n== Block / Unblock ==");
{
  const bl = await sb.from("blocked_slots").upsert({
    slot_id: "d-0500",
    booking_date: testDate,
    reason: "__test_block",
  }, { onConflict: "slot_id,booking_date" });
  check("block slot ok", bl.error === null, bl.error?.message);
  const { data: availBlocked } = await sb.rpc("get_day_availability", { p_date: testDate });
  const s = (availBlocked ?? []).find((r) => r.slot_id === "d-0500")?.status;
  check("blocked slot shows blocked", s === "blocked", s);

  // blocked slot cannot be manually booked
  const mb = await sb.rpc("create_manual_booking", {
    p_customer_name: "__test_flow Blocked",
    p_phone_number: "01999999995",
    p_whatsapp_number: "01999999995",
    p_booking_date: testDate,
    p_slot_ids: ["d-0500"],
  });
  check("manual booking on blocked slot rejected", mb.error !== null && String(mb.error.message).includes("SLOT_BLOCKED"), mb.error?.message ?? "none");

  const ul = await sb.from("blocked_slots").delete().eq("slot_id", "d-0500").eq("booking_date", testDate);
  check("unblock ok", ul.error === null, ul.error?.message);
}

// 6. Multi-slot manual booking + cancel releases
console.log("\n== Multi-slot + cancel release ==");
{
  const m3 = await sb.rpc("create_manual_booking", {
    p_customer_name: "__test_flow Multi",
    p_phone_number: "01999999996",
    p_whatsapp_number: "01999999996",
    p_booking_date: testDate,
    p_slot_ids: ["d-0800", "d-0930", "d-1100", "d-1230"],
  });
  check("multi-slot manual created", m3.error === null, m3.error?.message);
  const multiId = m3.data?.id;

  const { data: mBooking } = await sb.from("bookings").select("duration_minutes,price,slot_count,start_time,end_time,slot_category").eq("id", multiId).single();
  check("multi-slot aggregates", mBooking?.duration_minutes === 360 && mBooking?.slot_count === 4 && mBooking?.slot_category === "day", JSON.stringify(mBooking));

  // cancel -> releases slots
  const cn = await sb.from("bookings").update({ status: "cancelled" }).eq("id", multiId);
  check("cancel ok", cn.error === null, cn.error?.message);
  const { data: availAfterCancel } = await sb.rpc("get_day_availability", { p_date: testDate });
  const d0800 = (availAfterCancel ?? []).find((r) => r.slot_id === "d-0800")?.status;
  check("cancelled multi-slot released", d0800 === "available", d0800);
}

// 7. Concurrency: fire 5 simultaneous manual bookings for same slot
console.log("\n== Concurrency ==");
{
  const results = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      sb.rpc("create_manual_booking", {
        p_customer_name: `__test_flow RACE${i}`,
        p_phone_number: `0199999999${i}`,
        p_whatsapp_number: `0199999999${i}`,
        p_booking_date: testDate,
        p_slot_ids: ["d-1530"],
      }),
    ),
  );
  const ok = results.filter((r) => r.error === null).length;
  check("exactly one concurrent booking wins", ok === 1, `winners=${ok}`);
}

await cleanup();

console.log(`\n===== RESULT: ${pass} passed, ${fail} failed =====\n`);
process.exit(fail > 0 ? 1 : 0);
