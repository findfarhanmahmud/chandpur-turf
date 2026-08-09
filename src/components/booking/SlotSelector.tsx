"use client";

import { type TimeSlot, type SlotAvailability } from "@/types/booking";
import { toggleSlotSelection } from "@/lib/slotSelection";
import { formatPrice } from "@/lib/utils";
import { buildCategoryConfigs } from "@/lib/booking/categories";

interface SlotSelectorProps {
  slots: TimeSlot[];
  selectedSlots: TimeSlot[];
  onSlotsChange: (slots: TimeSlot[]) => void;
  isLoading?: boolean;
}

const UNAVAILABLE_LABELS: Record<string, string> = {
  booked: "SOLD OUT",
  blocked: "BLOCKED",
  elapsed: "CLOSED",
};

function getUnavailableLabel(status: SlotAvailability | undefined): string {
  if (!status) return "UNAVAILABLE";
  return UNAVAILABLE_LABELS[status] ?? "UNAVAILABLE";
}

function SlotColumn({
  categorySlots,
  selectedSlots,
  onSlotSelect,
  isFeatured,
  config,
}: {
  categorySlots: TimeSlot[];
  selectedSlots: TimeSlot[];
  onSlotSelect: (slot: TimeSlot) => void;
  isFeatured: boolean;
  config: { label: string; icon: string; price: number; durationMinutes: number };
}) {
  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        border: isFeatured
          ? "1px solid #c3f400"
          : "1px solid rgba(68,73,51,0.6)",
        borderRadius: "0.5rem",
        boxShadow: isFeatured ? "0 0 15px rgba(195,244,0,0.15)" : undefined,
        position: "relative",
      }}
    >
      {/* Popular badge */}
      {isFeatured && (
        <div
          className="absolute top-0 right-0 px-2 py-1"
          style={{
            backgroundColor: "#c3f400",
            color: "#556d00",
            fontFamily: "var(--font-jetbrains)",
            fontSize: "10px",
            letterSpacing: "0.08em",
            fontWeight: 700,
            borderRadius: "0 0.5rem 0 0.5rem",
          }}
        >
          POPULAR
        </div>
      )}

      {/* Column header */}
      <div
        className="p-3 text-center border-b flex flex-col items-center gap-1"
        style={{
          backgroundColor: isFeatured
            ? "rgba(195,244,0,0.1)"
            : "#333535",
          borderColor: isFeatured
            ? "rgba(195,244,0,0.3)"
            : "rgba(68,73,51,0.6)",
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            color: isFeatured ? "#c3f400" : "#c4c9ac",
            fontSize: "22px",
            fontVariationSettings: "'FILL' 1",
          }}
        >
          {config.icon}
        </span>
        <h3
          className="uppercase"
          style={{
            fontFamily: "var(--font-oswald)",
            fontSize: "18px",
            color: isFeatured ? "#c3f400" : "#ffffff",
          }}
        >
          {config.label}
        </h3>
        <p
          style={{
            fontFamily: "var(--font-jetbrains)",
            fontSize: "11px",
            color: isFeatured ? "#ffffff" : "#c3f400",
            letterSpacing: "0.06em",
          }}
        >
          {formatPrice(config.price)} / {config.durationMinutes} MINS
        </p>
      </div>

      {/* Column sub-header */}
      <div
        className="grid grid-cols-2 gap-1 px-1 py-1 text-center border-b"
        style={{
          backgroundColor: "#282a2b",
          borderColor: "rgba(68,73,51,0.5)",
          fontFamily: "var(--font-jetbrains)",
          fontSize: "11px",
          color: "#c4c9ac",
          letterSpacing: "0.06em",
        }}
      >
        <div>TIME</div>
        <div>PRICE</div>
      </div>

      {/* Scrollable slot list */}
      <div
        className="flex flex-col gap-1 p-1 overflow-y-auto slot-scroll"
        style={{ maxHeight: "300px" }}
      >
        {categorySlots.map((slot) => {
          const isSelected = selectedSlots.some((s) => s.id === slot.id);
          if (slot.isBooked) {
            return (
              <div
                key={slot.id}
                className="grid grid-cols-2 gap-1 p-3 items-center booked-pattern"
                style={{
                  borderRadius: "0.25rem",
                  opacity: 0.4,
                  cursor: "not-allowed",
                }}
              >
                <div
                  className="flex items-center gap-1 justify-center line-through"
                  style={{ fontFamily: "var(--font-work-sans)", fontSize: "13px" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                    schedule
                  </span>
                  {slot.time}
                </div>
                <div
                  className="text-center line-through"
                  style={{
                    fontFamily: "var(--font-jetbrains)",
                    fontSize: "11px",
                    letterSpacing: "0.04em",
                  }}
                >
                  {getUnavailableLabel(slot.availability)}
                </div>
              </div>
            );
          }
          return (
            <button
              key={slot.id}
              onClick={() => onSlotSelect(slot)}
              aria-pressed={isSelected}
              aria-label={`Select ${slot.time} slot for ${formatPrice(slot.price)}`}
              className="grid grid-cols-2 gap-1 p-3 items-center transition-all duration-150 focus:outline-none focus-visible:ring-2 relative group"
              style={{
                borderRadius: "0.25rem",
                backgroundColor: isSelected ? "#c3f400" : "transparent",
                color: isSelected ? "#283500" : "#e2e2e2",
                boxShadow: isSelected
                  ? "0 0 10px rgba(195,244,0,0.35)"
                  : undefined,
                border: isSelected
                  ? "1px solid #c3f400"
                  : "1px solid transparent",
                fontWeight: isSelected ? 700 : 400,
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#333535";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                }
              }}
            >
              <div
                className="flex items-center gap-1 justify-center"
                style={{ fontFamily: "var(--font-work-sans)", fontSize: "13px" }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "14px",
                    color: isSelected ? "#283500" : "#c3f400",
                  }}
                >
                  {isSelected ? "check_circle" : "schedule"}
                </span>
                {slot.time}
              </div>
              <div
                className="text-center"
                style={{
                  fontFamily: "var(--font-jetbrains)",
                  fontSize: "11px",
                  letterSpacing: "0.04em",
                }}
              >
                {formatPrice(slot.price)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function SlotSelector({
  slots,
  selectedSlots,
  onSlotsChange,
  isLoading = false,
}: SlotSelectorProps) {
  const configs = buildCategoryConfigs(slots);
  const daySlots = slots.filter((s) => s.category === "day");
  const nightSlots = slots.filter((s) => s.category === "night");

  return (
    <section
      id="slot-section"
      className="rounded-xl border p-6"
      style={{
        backgroundColor: "#1e2020",
        borderColor: "rgba(68,73,51,0.3)",
      }}
    >
      <h2
        className="flex items-center gap-3 mb-2"
        style={{
          fontFamily: "var(--font-oswald)",
          fontSize: "20px",
          color: "#ffffff",
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ color: "#c3f400" }}
        >
          schedule
        </span>
        2. Select Time Slot
      </h2>
      <p
        className="mb-6"
        style={{
          fontFamily: "var(--font-work-sans)",
          fontSize: "13px",
          color: "#c4c9ac",
        }}
      >
        Select one or more consecutive slots in the same category. Adjacent
        selections are combined into a single booking.
      </p>

      {isLoading && slots.length === 0 ? (
        <div
          className="flex items-center justify-center gap-3 py-12"
          style={{
            fontFamily: "var(--font-jetbrains)",
            fontSize: "12px",
            color: "#c4c9ac",
            letterSpacing: "0.06em",
          }}
        >
          <span
            aria-hidden="true"
            className="inline-block h-5 w-5 rounded-full border-2 border-[#c3f400] border-t-transparent animate-spin"
          />
          LOADING AVAILABILITY...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SlotColumn
            categorySlots={daySlots}
            selectedSlots={selectedSlots}
            onSlotSelect={(slot) =>
              onSlotsChange(
                toggleSlotSelection(selectedSlots, slot, daySlots),
              )
            }
            isFeatured={Boolean(configs.day.popular)}
            config={configs.day}
          />
          <SlotColumn
            categorySlots={nightSlots}
            selectedSlots={selectedSlots}
            onSlotSelect={(slot) =>
              onSlotsChange(
                toggleSlotSelection(selectedSlots, slot, nightSlots),
              )
            }
            isFeatured={false}
            config={configs.night}
          />
        </div>
      )}
    </section>
  );
}
