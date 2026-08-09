import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { getAdminSession } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Admin Login | Chandpur Turf",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: "#0c0f0f" }}
    >
      <div className="pointer-events-none fixed inset-0 turf-pattern opacity-40" aria-hidden="true" />
      <div className="relative w-full flex justify-center">
        <LoginForm />
      </div>
    </main>
  );
}
