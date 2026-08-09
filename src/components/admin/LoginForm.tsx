"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button, FieldError, Input, Label } from "@/components/admin/ui";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const next = searchParams.get("next") || "/admin";
  const forbidden = searchParams.get("error") === "forbidden";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setError("Invalid username or password.");
        setPending(false);
        return;
      }

      // Server-side requireAdmin() re-verifies the admin role on redirect;
      // if the user is not an active admin they are bounced back here.
      router.push(next);
      router.refresh();
    } catch {
      setError("Could not sign in. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#c3f400] text-xl font-bold text-[#283500]">
          CT
        </div>
        <h1
          className="italic uppercase tracking-tighter text-white"
          style={{ fontFamily: "var(--font-oswald)", fontSize: "28px" }}
        >
          Chandpur Turf
        </h1>
        <p
          className="mt-1 text-[11px] uppercase tracking-[0.3em] text-[#c3f400]"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          Admin Console
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-[#444933]/40 bg-[#1a1c1c] p-6"
      >
        {forbidden && (
          <p className="rounded-lg border border-[#93000a]/50 bg-[#93000a]/20 px-3 py-2 text-[12px] text-[#ffb4ab]">
            Your account is not authorized as an admin.
          </p>
        )}

        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin123"
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && <FieldError>{error}</FieldError>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Signing in..." : "Sign In"}
          {!pending && (
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-[12px] text-[#8e9379]">
        Authorized admins only. All actions are logged and protected by RLS.
      </p>
    </div>
  );
}

export default function LoginForm() {
  return (
    <Suspense>
      <LoginFormInner />
    </Suspense>
  );
}
