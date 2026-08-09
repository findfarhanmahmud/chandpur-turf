"use client";

import { cn } from "@/lib/utils";
import { useEffect, type ReactNode } from "react";

// Shared admin UI primitives following the Chandpur Turf visual language
// (dark surface, neon green #c3f400, Oswald headings, JetBrains Mono labels).

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#444933]/40 bg-[#1a1c1c] p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h3
          className="uppercase tracking-wide text-white"
          style={{ fontFamily: "var(--font-oswald)", fontSize: "18px" }}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            className="mt-1 text-[11px] uppercase tracking-widest text-[#c4c9ac]"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {right}
    </div>
  );
}

const BUTTON_VARIANTS = {
  primary:
    "bg-[#c3f400] text-[#283500] hover:bg-[#d2ff1a] shadow-[0_0_14px_rgba(195,244,0,0.25)]",
  outline:
    "border border-[#444933] text-[#e2e2e2] hover:border-[#c3f400] hover:text-[#c3f400]",
  danger: "border border-[#93000a]/60 text-[#ffb4ab] hover:border-[#ffb4ab] hover:bg-[#93000a]/20",
  ghost: "text-[#c4c9ac] hover:text-[#c3f400]",
  subtle:
    "bg-[#0c0f0f] border border-[#444933]/60 text-[#e2e2e2] hover:border-[#c3f400]/60 hover:text-[#c3f400]",
} as const;

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof BUTTON_VARIANTS;
  size?: "sm" | "md";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-oswald font-semibold uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "px-3 py-1.5 text-[11px]" : "px-4 py-2.5 text-[12px]",
        BUTTON_VARIANTS[variant],
        className,
      )}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Input({
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-[#444933] bg-[#0c0f0f] px-3 py-2.5 text-sm text-[#e2e2e2] outline-none transition-colors placeholder:text-[#8e9379] focus:border-[#c3f400] focus:ring-1 focus:ring-[#c3f400]/40",
        className,
      )}
      {...rest}
    />
  );
}

export function Textarea({
  className,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-[#444933] bg-[#0c0f0f] px-3 py-2.5 text-sm text-[#e2e2e2] outline-none transition-colors placeholder:text-[#8e9379] focus:border-[#c3f400] focus:ring-1 focus:ring-[#c3f400]/40",
        className,
      )}
      {...rest}
    />
  );
}

export function Select({
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-lg border border-[#444933] bg-[#0c0f0f] px-3 py-2.5 text-sm text-[#e2e2e2] outline-none transition-colors focus:border-[#c3f400]",
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  );
}

export function Label({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-[#c4c9ac]"
      style={{ fontFamily: "var(--font-jetbrains)" }}
    >
      {children}
    </label>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "amber" | "red" | "blue";
}) {
  const tones = {
    neutral: "bg-[#282a2b] text-[#c4c9ac] border-[#444933]",
    green: "bg-[#c3f400]/15 text-[#c3f400] border-[#c3f400]/40",
    amber: "bg-[#e6a700]/15 text-[#ffd75e] border-[#e6a700]/40",
    red: "bg-[#93000a]/25 text-[#ffb4ab] border-[#93000a]/50",
    blue: "bg-[#4aa8ff]/15 text-[#8fd0ff] border-[#4aa8ff]/40",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        tones[tone],
        "border",
      )}
      style={{ fontFamily: "var(--font-jetbrains)" }}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; tone: "green" | "amber" | "red" | "blue" }> = {
    pending: { label: "PENDING", tone: "amber" },
    confirmed: { label: "CONFIRMED", tone: "green" },
    cancelled: { label: "CANCELLED", tone: "red" },
    completed: { label: "COMPLETED", tone: "blue" },
  };
  const cfg = map[status] ?? { label: status.toUpperCase(), tone: "neutral" as const };
  return <Badge tone={cfg.tone}>{cfg.label}</Badge>;
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-[#c4c9ac]">
      <span
        className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-[#c3f400] border-t-transparent"
        aria-hidden="true"
      />
      {label && (
        <span
          className="text-[11px] uppercase tracking-widest"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <span className="material-symbols-outlined text-[#444933] text-4xl">
        inventory_2
      </span>
      <p className="text-sm text-[#c4c9ac]">{message}</p>
    </div>
  );
}

export function FieldError({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1.5 text-[12px] text-[#ffb4ab]">{children}</p>
  );
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={cn(
          "max-h-[90vh] w-full overflow-y-auto rounded-xl border border-[#444933]/50 bg-[#1a1c1c] shadow-2xl",
          wide ? "max-w-2xl" : "max-w-md",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#444933]/40 px-5 py-4">
          <div>
            <h3
              className="uppercase tracking-wide text-white"
              style={{ fontFamily: "var(--font-oswald)", fontSize: "17px" }}
            >
              {title}
            </h3>
            {subtitle && (
              <p
                className="mt-1 text-[10px] uppercase tracking-widest text-[#c4c9ac]"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#444933] text-[#c4c9ac] transition-colors hover:border-[#c3f400] hover:text-[#c3f400]"
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
