"use client";

import { useEffect } from "react";

interface BookingNoticeProps {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}

export default function BookingNotice({
  type,
  message,
  onClose,
}: BookingNoticeProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 8000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === "success";
  const accent = isSuccess ? "#c3f400" : "#ffb4ab";
  const borderColor = isSuccess
    ? "rgba(195,244,0,0.5)"
    : "rgba(255,180,171,0.5)";

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-50 flex items-start gap-3 rounded-xl border px-5 py-4 shadow-2xl -translate-x-1/2"
      style={{
        backgroundColor: "#121414",
        borderColor,
        maxWidth: "min(480px, calc(100vw - 32px))",
      }}
    >
      <span
        className="material-symbols-outlined flex-shrink-0"
        style={{ color: accent, fontSize: "24px" }}
      >
        {isSuccess ? "check_circle" : "error"}
      </span>
      <p
        style={{
          fontFamily: "var(--font-work-sans)",
          fontSize: "14px",
          lineHeight: 1.5,
          color: "#e2e2e2",
        }}
      >
        {message}
      </p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="flex-shrink-0"
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          color: "#8e9379",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
          close
        </span>
      </button>
    </div>
  );
}
