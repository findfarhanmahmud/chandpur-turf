import { type BookingRecord } from '@/types/booking';
import { openWhatsApp, WHATSAPP_NOTICE_MESSAGES } from '@/lib/whatsapp';

export interface BookingSubmissionResult {
  success: boolean;
  message: string;
}

// Transport for the prepared booking.
// Current transport: WhatsApp.
// To persist via a real backend later, replace the body below with e.g.:
//   const res = await fetch('/api/bookings', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(booking),
//   });
//   return res.ok
//     ? { success: true, message: '...' }
//     : { success: false, message: '...' };
// The UI only depends on this function, so the switch is a drop-in change.
export async function submitBooking(booking: BookingRecord): Promise<BookingSubmissionResult> {
  const opened = openWhatsApp(booking);
  return opened
    ? { success: true, message: WHATSAPP_NOTICE_MESSAGES.success }
    : { success: false, message: WHATSAPP_NOTICE_MESSAGES.failure };
}
