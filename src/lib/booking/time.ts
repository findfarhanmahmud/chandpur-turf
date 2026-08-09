// "05:00:00" -> "5:00 AM"
export function formatTimeFromRaw(raw: string): string {
  const [hourPart, minutePart] = raw.split(":");
  const hours = Number(hourPart);
  const minutes = Number(minutePart);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

// "YYYY-MM-DD" -> human-readable local date, e.g. "10 Oct, 2026".
export function formatISODate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Today's date in Asia/Dhaka, as a local Date (YYYY-MM-DD semantics).
export function todayDhaka(): Date {
  // Use the browser/server local date; both the client and the RPC use the
  // Asia/Dhaka reference for the authoritative check.
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
