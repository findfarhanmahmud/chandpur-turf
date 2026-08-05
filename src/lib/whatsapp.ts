import { type BookingRecord } from '@/types/booking';
import { formatPrice } from '@/lib/utils';
import { formatBookingDate, getSlotCategoryLabel } from '@/lib/booking';

export const WHATSAPP_BUSINESS_NUMBER = '8801974172403';
export const WHATSAPP_CONTACT_DISPLAY = '01974172403';

export const WHATSAPP_NOTICE_MESSAGES = {
  success:
    'Booking prepared successfully. WhatsApp will open so you can send your booking request.',
  failure: 'Unable to open WhatsApp. Please contact us directly at 01974172403.',
} as const;

export function buildWhatsAppMessage(booking: BookingRecord): string {
  const lines = [
    '*NEW TURF BOOKING REQUEST*',
    '',
    '👤 *Customer*',
    `Name: ${booking.customerName}`,
    '',
    '📞 Phone:',
    booking.phoneNumber,
    '',
    '💬 WhatsApp:',
    booking.whatsappNumber,
    '',
    'Booking Date:',
    `*${formatBookingDate(booking.bookingDate)}*`,
    '',
    'Time:',
    `*${booking.selectedTime}*`,
    '',
    'Slot:',
    `*${getSlotCategoryLabel(booking.slotCategory)}*`,
    '',
    'Duration:',
    `${booking.duration} Minutes`,
    '',
    'Total Price:',
    `*${formatPrice(booking.price)}*`,
    '',
    'Notes:',
    booking.notes || 'None',
    '',
    'Booking Status:',
    'Pending Confirmation',
    '',
    'Please confirm this booking',
    '',
    '(Generated from the Chandpur Turf Website)',
  ];
  return lines.join('\n');
}

export function buildWhatsAppUrl(booking: BookingRecord): string {
  const message = buildWhatsAppMessage(booking);
  return `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(booking: BookingRecord): boolean {
  const url = buildWhatsAppUrl(booking);
  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  return opened !== null;
}
