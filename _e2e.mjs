import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const BASE = "http://localhost:3000";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function cleanup() {
  const { data } = await sb.from("bookings").select("id").ilike("customer_name", "__e2e%");
  const ids = (data ?? []).map((b) => b.id);
  if (ids.length) await sb.from("bookings").delete().in("id", ids);
}

async function main() {
  await cleanup();

  const login = await fetch(`${BASE}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin123", password: "admin123" }),
    redirect: "manual",
  });
  const setCookie = login.headers.get("set-cookie") ?? "";
  const cookie = setCookie.split(";")[0];
  if (!cookie) { console.log("LOGIN FAILED"); return; }
  const headers = { "Content-Type": "application/json", Cookie: cookie };

  const d = new Date();
  d.setDate(d.getDate() + 12);
  const testDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  console.log("Test date:", testDate);

  // 1. BOOK & LOCK
  const bookRes = await fetch(`${BASE}/api/admin/bookings/manual`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      customerName: "__e2e complete test",
      phoneNumber: "01999999971",
      whatsappNumber: "01999999971",
      bookingDate: testDate,
      slotIds: ["d-0930"],
      price: 1500,
    }),
  });
  const bookJson = await bookRes.json().catch(() => null);
  console.log("\n[1] BOOK & LOCK:", bookRes.status, bookJson?.booking?.status ?? bookJson?.message);
  const bookingId = bookJson?.booking?.id;

  // 2. COMPLETE via PATCH
  const patchRes = await fetch(`${BASE}/api/admin/bookings/${bookingId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status: "completed" }),
  });
  const patchJson = await patchRes.json().catch(() => null);
  console.log("[2] COMPLETE PATCH:", patchRes.status, patchJson?.booking?.status ?? patchJson?.message);

  // 3. Schedule now
  const schedRes = await fetch(`${BASE}/api/admin/schedule?from=${testDate}&to=${testDate}`, { headers });
  const sched = await schedRes.json().catch(() => null);
  const entry = sched?.entries?.[testDate]?.["d-0930"];
  console.log("[3] Schedule entry for d-0930 after COMPLETE:", JSON.stringify(entry));
  const bookingInSched = (sched?.bookings ?? []).find((b) => b.id === bookingId);
  console.log("    booking visible in schedule data:", bookingInSched ? `yes (status=${bookingInSched.status})` : "NO");

  // 4. Attempt to BOOK & LOCK the same slot again (the misleading-warning path)
  const rebookRes = await fetch(`${BASE}/api/admin/bookings/manual`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      customerName: "__e2e rebook attempt",
      phoneNumber: "01999999972",
      whatsappNumber: "01999999972",
      bookingDate: testDate,
      slotIds: ["d-0930"],
      price: 1500,
    }),
  });
  const rebookJson = await rebookRes.json().catch(() => null);
  console.log("[4] Re-book same slot (direct API):", rebookRes.status, rebookJson?.message ?? "created");
  console.log("    NOTE: in the UI this slot is now shown as BOOKED, so the Book & Lock button is not offered.");

  // 5. Bookings history
  const listRes = await fetch(`${BASE}/api/admin/bookings?search=__e2e`, { headers });
  const list = await listRes.json().catch(() => null);
  const found = (list?.bookings ?? []).find((b) => b.id === bookingId);
  console.log("[5] Booking history contains completed booking:", found ? `yes (status=${found.status})` : "NO");

  await cleanup();
  console.log("\nDone. Test data cleaned up.");
}

main().catch((e) => { console.error("ERROR:", e); process.exit(1); });
