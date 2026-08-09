import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function cleanup(pattern) {
  const { data } = await sb.from("bookings").select("id").ilike("customer_name", pattern);
  const ids = (data ?? []).map((b) => b.id);
  if (ids.length) {
    const r = await sb.from("bookings").delete().in("id", ids);
    console.log(`deleted ${ids.length} rows matching ${pattern}`, r.error ?? "");
  } else {
    console.log(`nothing to delete for ${pattern}`);
  }
}

await cleanup("__e2e%");
await cleanup("__verify%");
await cleanup("__inspect%");
await cleanup("__test%");
await cleanup("__x%");
