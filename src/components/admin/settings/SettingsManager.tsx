"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminSetting } from "@/types/admin";
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  Input,
  Label,
  Spinner,
  Textarea,
} from "@/components/admin/ui";

const FIELD_GROUPS: {
  title: string;
  subtitle: string;
  fields: { key: string; label: string; textarea?: boolean; hint?: string }[];
}[] = [
  {
    title: "Contact",
    subtitle: "Phone numbers shown across the site",
    fields: [
      { key: "phone", label: "Phone", hint: "e.g. 01777-240317" },
      { key: "whatsapp", label: "WhatsApp (display)", hint: "e.g. 01856-822363" },
      { key: "booking_whatsapp", label: "Booking WhatsApp", hint: "For booking confirmation messages" },
      {
        key: "booking_whatsapp_international",
        label: "Booking WhatsApp (international)",
        hint: "Country code, no + sign, e.g. 8801974172403",
      },
    ],
  },
  {
    title: "Location",
    subtitle: "Address and maps",
    fields: [
      { key: "location", label: "Full address" },
      { key: "address_short", label: "Short address" },
      { key: "map_query", label: "Map query", hint: "Used for Google Maps directions" },
    ],
  },
  {
    title: "Social",
    subtitle: "Facebook and Instagram",
    fields: [
      { key: "facebook", label: "Facebook name" },
      { key: "facebook_url", label: "Facebook URL" },
      { key: "instagram", label: "Instagram handle", hint: "Without the @" },
      { key: "instagram_url", label: "Instagram URL" },
    ],
  },
  {
    title: "General",
    subtitle: "Site-wide business info",
    fields: [
      { key: "turf_name", label: "Turf name" },
      { key: "hours", label: "Opening hours", hint: "e.g. 5:00 AM - 3:30 AM" },
    ],
  },
];

export default function SettingsManager() {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [account, setAccount] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountNotice, setAccountNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, sessionRes] = await Promise.all([
        fetch("/api/admin/settings", { cache: "no-store" }),
        fetch("/api/admin/auth/session", { cache: "no-store" }),
      ]);
      if (!settingsRes.ok || !sessionRes.ok) throw new Error("failed");
      const settingsData = await settingsRes.json();
      const sessionData = await sessionRes.json();

      const map: Record<string, string> = {};
      (settingsData.settings as AdminSetting[]).forEach((s) => {
        map[s.key] = s.value;
      });
      setValues(map);

      const username = sessionData?.session?.username;
      if (typeof username === "string") {
        setCurrentUsername(username);
        setAccount((prev) => ({ ...prev, username }));
      }
    } catch {
      setError("Could not load settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "Could not save settings");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  async function updateCredentials(e: React.FormEvent) {
    e.preventDefault();
    if (savingAccount) return;
    setSavingAccount(true);
    setAccountNotice(null);
    try {
      const res = await fetch("/api/admin/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newUsername: account.username,
          newPassword: account.password,
          confirmPassword: account.confirmPassword,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message ?? "Could not update credentials");
      }
      const newUsername = typeof data?.username === "string" ? data.username : account.username;
      if (data?.sessionsRevoked) {
        // The password change revoked every session (this one included), so a
        // fresh sign-in is required with the new credentials.
        router.push("/admin/login");
        router.refresh();
        return;
      }
      setCurrentUsername(newUsername);
      setAccount({ username: newUsername, password: "", confirmPassword: "" });
      setAccountNotice({
        type: "ok",
        text: "Credentials updated. New details will apply from your next sign-in.",
      });
    } catch (err) {
      setAccountNotice({
        type: "err",
        text: err instanceof Error ? err.message : "Could not update credentials.",
      });
    } finally {
      setSavingAccount(false);
    }
  }

  if (loading) return <Spinner label="Loading settings" />;
  if (error && Object.keys(values).length === 0)
    return <EmptyState message={error} />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Admin Account"
          subtitle="Change your admin login username and password"
        />
        <form onSubmit={updateCredentials} className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="acct-username">Username</Label>
            <Input
              id="acct-username"
              autoComplete="off"
              required
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_.-]+"
              value={account.username}
              onChange={(e) => setAccount((p) => ({ ...p, username: e.target.value }))}
            />
            <p className="mt-1 text-[11px] text-[#8e9379]">
              Current username: {currentUsername ?? "—"}
            </p>
          </div>
          <div>
            <Label htmlFor="acct-password">New Password</Label>
            <Input
              id="acct-password"
              type="password"
              autoComplete="new-password"
              placeholder="Min 8 characters"
              value={account.password}
              onChange={(e) => setAccount((p) => ({ ...p, password: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="acct-confirm">Confirm New Password</Label>
            <Input
              id="acct-confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat password"
              value={account.confirmPassword}
              onChange={(e) => setAccount((p) => ({ ...p, confirmPassword: e.target.value }))}
            />
          </div>
          <div className="md:col-span-3 flex items-center gap-3">
            <Button type="submit" disabled={savingAccount}>
              {savingAccount ? "Updating..." : "Update Credentials"}
            </Button>
            {accountNotice && (
              <p
                className={`text-[12px] ${
                  accountNotice.type === "ok" ? "text-[#c3f400]" : "text-[#ffb4ab]"
                }`}
              >
                {accountNotice.text}
              </p>
            )}
          </div>
        </form>
      </Card>

      <form onSubmit={save} className="space-y-4">
        {saved && (
          <p className="rounded-lg border border-[#c3f400]/40 bg-[#c3f400]/10 px-3 py-2 text-[12px] text-[#c3f400]">
            Settings saved. The public site will pick them up on its next load.
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {FIELD_GROUPS.map((group) => (
            <Card key={group.title}>
              <CardHeader title={group.title} subtitle={group.subtitle} />
              <div className="space-y-3">
                {group.fields.map((field) => (
                  <div key={field.key}>
                    <Label htmlFor={`setting-${field.key}`}>{field.label}</Label>
                    {field.textarea ? (
                      <Textarea
                        id={`setting-${field.key}`}
                        rows={2}
                        value={values[field.key] ?? ""}
                        onChange={(e) =>
                          setValues((p) => ({ ...p, [field.key]: e.target.value }))
                        }
                      />
                    ) : (
                      <Input
                        id={`setting-${field.key}`}
                        value={values[field.key] ?? ""}
                        onChange={(e) =>
                          setValues((p) => ({ ...p, [field.key]: e.target.value }))
                        }
                      />
                    )}
                    {field.hint && (
                      <p className="mt-1 text-[11px] text-[#8e9379]">{field.hint}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
          {error && <p className="text-[12px] text-[#ffb4ab]">{error}</p>}
        </div>
      </form>
    </div>
  );
}
