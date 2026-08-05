"use client";

import { type ChangeEvent } from "react";
import { type BookingFormData, type BookingFormErrors } from "@/types/booking";

interface DetailsFormProps {
  formData: BookingFormData;
  formErrors: BookingFormErrors;
  isEnabled: boolean;
  onChange: (field: keyof BookingFormData, value: string) => void;
}

interface FieldProps {
  label: string;
  id: string;
  type?: string;
  placeholder: string;
  value: string;
  error?: string;
  isEnabled: boolean;
  onChange: (value: string) => void;
  required?: boolean;
  multiline?: boolean;
}

const inputBaseStyle: React.CSSProperties = {
  backgroundColor: "#121414",
  borderRadius: "0.25rem",
  padding: "12px",
  color: "#e2e2e2",
  fontFamily: "var(--font-work-sans)",
  fontSize: "16px",
};

function Field({
  label,
  id,
  type = "text",
  placeholder,
  value,
  error,
  isEnabled,
  onChange,
  required,
  multiline,
}: FieldProps) {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.border = "1px solid #c3f400";
    e.currentTarget.style.boxShadow = "0 0 0 1px #c3f400";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.border = error
      ? "1px solid #ffb4ab"
      : "1px solid rgba(68,73,51,0.6)";
    e.currentTarget.style.boxShadow = "none";
  };

  const inputStyle: React.CSSProperties = {
    ...inputBaseStyle,
    border: error ? "1px solid #ffb4ab" : "1px solid rgba(68,73,51,0.6)",
    cursor: isEnabled ? "text" : "not-allowed",
    opacity: isEnabled ? 1 : 0.6,
  };

  const sharedProps = {
    id,
    placeholder,
    value,
    disabled: !isEnabled,
    required,
    "aria-invalid": !!error,
    "aria-describedby": error ? `${id}-error` : undefined,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    onFocus: handleFocus,
    onBlur: handleBlur,
    className: "w-full outline-none transition-all duration-200",
  };

  return (
    <div>
      <label
        htmlFor={id}
        style={{
          display: "block",
          fontFamily: "var(--font-jetbrains)",
          fontSize: "11px",
          letterSpacing: "0.08em",
          color: "#c4c9ac",
          marginBottom: "6px",
        }}
      >
        {label}
        {required && (
          <span style={{ color: "#ffb4ab", marginLeft: "4px" }}>*</span>
        )}
      </label>
      {multiline ? (
        <textarea
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
          {...sharedProps}
        />
      ) : (
        <input type={type} style={inputStyle} {...sharedProps} />
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          style={{
            fontFamily: "var(--font-jetbrains)",
            fontSize: "10px",
            color: "#ffb4ab",
            marginTop: "4px",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default function DetailsForm({
  formData,
  formErrors,
  isEnabled,
  onChange,
}: DetailsFormProps) {
  return (
    <section
      id="details-section"
      className="rounded-xl border p-6 transition-opacity duration-300"
      style={{
        backgroundColor: "#1e2020",
        borderColor: "rgba(68,73,51,0.3)",
        opacity: isEnabled ? 1 : 0.5,
        pointerEvents: isEnabled ? "auto" : "none",
      }}
    >
      <h2
        className="flex items-center gap-3 mb-6"
        style={{
          fontFamily: "var(--font-oswald)",
          fontSize: "20px",
          color: "#ffffff",
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ color: isEnabled ? "#c3f400" : "#8e9379" }}
        >
          person
        </span>
        3. Your Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field
          label="FULL NAME"
          id="name"
          type="text"
          placeholder="Enter your name"
          value={formData.name}
          error={formErrors.name}
          isEnabled={isEnabled}
          onChange={(v) => onChange("name", v)}
          required
        />
        <Field
          label="PHONE NUMBER"
          id="phone"
          type="tel"
          placeholder="017..."
          value={formData.phone}
          error={formErrors.phone}
          isEnabled={isEnabled}
          onChange={(v) => onChange("phone", v)}
          required
        />
        <Field
          label="WHATSAPP NUMBER (OPTIONAL)"
          id="whatsapp"
          type="tel"
          placeholder="Same as phone"
          value={formData.whatsapp}
          error={formErrors.whatsapp}
          isEnabled={isEnabled}
          onChange={(v) => onChange("whatsapp", v)}
        />
        <Field
          label="TEAM NAME (OPTIONAL)"
          id="team-name"
          type="text"
          placeholder="e.g. Chandpur United"
          value={formData.teamName}
          isEnabled={isEnabled}
          onChange={(v) => onChange("teamName", v)}
        />
        <div className="md:col-span-2">
          <Field
            label="NOTES (OPTIONAL)"
            id="notes"
            placeholder="Any special instructions for your booking"
            value={formData.notes}
            isEnabled={isEnabled}
            onChange={(v) => onChange("notes", v)}
            multiline
          />
        </div>
      </div>
    </section>
  );
}
