import type { SlotCategory } from "@/types/booking";

const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
export const MAX_SLOT_IDS = 8;

export interface CreateBookingRequestInput {
  customerName: string;
  phoneNumber: string;
  whatsappNumber: string;
  teamName?: string;
  notes?: string;
  bookingDate: string; // YYYY-MM-DD
  slotIds: string[];
}

export interface ServerValidationResult {
  ok: boolean;
  errors?: string[];
  parsed?: CreateBookingRequestInput;
}

// Validates the untrusted payload from the public booking form.
export function validateCreateBookingRequest(
  body: unknown,
): ServerValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, errors: ["Invalid request body."] };
  }
  const b = body as Record<string, unknown>;

  const name = typeof b.customerName === "string" ? b.customerName.trim() : "";
  if (!name) return { ok: false, errors: ["Full name is required."] };
  if (name.length < 2)
    return { ok: false, errors: ["Full name must be at least 2 characters."] };

  const phone = typeof b.phoneNumber === "string" ? b.phoneNumber.trim() : "";
  if (!phone) return { ok: false, errors: ["Phone number is required."] };
  if (!BD_PHONE_REGEX.test(phone))
    return {
      ok: false,
      errors: ["Enter a valid Bangladeshi phone number (e.g. 01712345678)."],
    };

  let whatsapp = typeof b.whatsappNumber === "string" ? b.whatsappNumber.trim() : "";
  if (!whatsapp) whatsapp = phone;
  if (!BD_PHONE_REGEX.test(whatsapp))
    return {
      ok: false,
      errors: ["Enter a valid Bangladeshi WhatsApp number (e.g. 01712345678)."],
    };

  const bookingDate = typeof b.bookingDate === "string" ? b.bookingDate.trim() : "";
  if (!DATE_REGEX.test(bookingDate))
    return { ok: false, errors: ["Please select a valid booking date."] };

  const slotIds =
    Array.isArray(b.slotIds) && b.slotIds.every((s) => typeof s === "string")
      ? (b.slotIds as string[])
      : [];
  if (slotIds.length === 0)
    return { ok: false, errors: ["Please select a time slot."] };
  if (slotIds.length > MAX_SLOT_IDS)
    return {
      ok: false,
      errors: [`You can select up to ${MAX_SLOT_IDS} consecutive slots.`],
    };

  const teamName = typeof b.teamName === "string" ? b.teamName.trim() : undefined;
  const notes = typeof b.notes === "string" ? b.notes.trim() : undefined;

  return {
    ok: true,
    parsed: {
      customerName: name,
      phoneNumber: phone,
      whatsappNumber: whatsapp,
      teamName,
      notes,
      bookingDate,
      slotIds,
    },
  };
}

export function isValidSlotCategory(value: string): value is SlotCategory {
  return value === "day" || value === "night";
}
