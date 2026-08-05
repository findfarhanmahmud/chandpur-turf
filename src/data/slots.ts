import type { TimeSlot, SlotCategory } from '@/types/booking';

// Morning slots: 5AM–9AM @ ৳1,999
const morningSlots: TimeSlot[] = [
  { id: 'm-5', time: '5:00 AM', endTime: '6:00 AM', price: 1999, category: 'morning', isBooked: false },
  { id: 'm-6', time: '6:00 AM', endTime: '7:00 AM', price: 1999, category: 'morning', isBooked: false },
  { id: 'm-7', time: '7:00 AM', endTime: '8:00 AM', price: 1999, category: 'morning', isBooked: false },
  { id: 'm-8', time: '8:00 AM', endTime: '9:00 AM', price: 1999, category: 'morning', isBooked: true  },
];

// Day slots: 9AM–5PM @ ৳1,499 (best value)
const daySlots: TimeSlot[] = [
  { id: 'd-9',  time: '9:00 AM',  endTime: '10:00 AM', price: 1499, category: 'day', isBooked: true  },
  { id: 'd-10', time: '10:00 AM', endTime: '11:00 AM', price: 1499, category: 'day', isBooked: false },
  { id: 'd-11', time: '11:00 AM', endTime: '12:00 PM', price: 1499, category: 'day', isBooked: false },
  { id: 'd-12', time: '12:00 PM', endTime: '1:00 PM',  price: 1499, category: 'day', isBooked: false },
  { id: 'd-13', time: '1:00 PM',  endTime: '2:00 PM',  price: 1499, category: 'day', isBooked: false },
  { id: 'd-14', time: '2:00 PM',  endTime: '3:00 PM',  price: 1499, category: 'day', isBooked: false },
  { id: 'd-15', time: '3:00 PM',  endTime: '4:00 PM',  price: 1499, category: 'day', isBooked: false },
  { id: 'd-16', time: '4:00 PM',  endTime: '5:00 PM',  price: 1499, category: 'day', isBooked: false },
];

// Night slots: 5PM–3AM @ ৳2,499
const nightSlots: TimeSlot[] = [
  { id: 'n-17', time: '5:00 PM',   endTime: '6:00 PM',  price: 2499, category: 'night', isBooked: false },
  { id: 'n-18', time: '6:00 PM',   endTime: '7:00 PM',  price: 2499, category: 'night', isBooked: false },
  { id: 'n-19', time: '7:00 PM',   endTime: '8:00 PM',  price: 2499, category: 'night', isBooked: false },
  { id: 'n-20', time: '8:00 PM',   endTime: '9:00 PM',  price: 2499, category: 'night', isBooked: false },
  { id: 'n-21', time: '9:00 PM',   endTime: '10:00 PM', price: 2499, category: 'night', isBooked: false },
  { id: 'n-22', time: '10:00 PM',  endTime: '11:00 PM', price: 2499, category: 'night', isBooked: false },
  { id: 'n-23', time: '11:00 PM',  endTime: '12:00 AM', price: 2499, category: 'night', isBooked: false },
  { id: 'n-0',  time: '12:00 AM',  endTime: '1:00 AM',  price: 2499, category: 'night', isBooked: false },
  { id: 'n-1',  time: '1:00 AM',   endTime: '2:00 AM',  price: 2499, category: 'night', isBooked: false },
  { id: 'n-2',  time: '2:00 AM',   endTime: '3:00 AM',  price: 2499, category: 'night', isBooked: false },
];

export const allSlots: TimeSlot[] = [...morningSlots, ...daySlots, ...nightSlots];

export const slotsByCategory: Record<SlotCategory, TimeSlot[]> = {
  morning: morningSlots,
  day: daySlots,
  night: nightSlots,
};

export const categoryConfig: Record<SlotCategory, {
  label: string;
  icon: string;
  price: number;
  popular?: boolean;
}> = {
  morning: {
    label: 'Morning Slot',
    icon: 'wb_twilight',
    price: 1999,
  },
  day: {
    label: 'Day Slot',
    icon: 'light_mode',
    price: 1499,
    popular: true,
  },
  night: {
    label: 'Night Slot',
    icon: 'dark_mode',
    price: 2499,
  },
};
