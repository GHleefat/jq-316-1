import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Booking, BookingStatus } from '@/types';
import { mockBookings } from '@/utils/mockData';
import { generateId } from '@/utils/calculations';
import { nowISO, formatTime } from '@/utils/dateTime';
import { calculateCost } from '@/utils/calculations';
import { useWalletStore } from './useWalletStore';
import { useParkingStore } from './useParkingStore';
import { useUserStore } from './useUserStore';

interface BookingState {
  bookings: Booking[];
  createBooking: (
    spotId: string,
    date: string,
    startTime: string,
    endTime: string,
    pricePerHour: number
  ) => Booking | null;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  confirmEndBooking: (id: string) => void;
  getBookingsByRenter: (renterId: string) => Booking[];
  getBookingsByOwner: (ownerId: string) => Booking[];
  getBookingById: (id: string) => Booking | undefined;
  markReviewed: (bookingId: string, byRenter: boolean) => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      bookings: mockBookings,

      createBooking: (spotId, date, startTime, endTime, pricePerHour) => {
        const spot = useParkingStore.getState().getSpotById(spotId);
        const currentUser = useUserStore.getState().currentUser;
        const wallet = useWalletStore.getState().getWalletByUserId(currentUser.id);

        if (!spot || !wallet) return null;

        const totalCost = calculateCost(startTime, endTime, pricePerHour);
        if (wallet.balance < totalCost) return null;

        const booking: Booking = {
          id: generateId('booking-'),
          spotId,
          renterId: currentUser.id,
          ownerId: spot.ownerId,
          date,
          startTime,
          endTime,
          totalCost,
          status: 'pending',
          createdAt: nowISO(),
          spotNumber: spot.spotNumber,
          building: spot.building,
          renterName: currentUser.name,
          ownerName: useUserStore.getState().getUserById(spot.ownerId)?.name,
          reviewedByRenter: false,
          reviewedByOwner: false,
        };

        set((state) => ({ bookings: [booking, ...state.bookings] }));
        return booking;
      },

      updateBookingStatus: (id, status) =>
        set((state) => ({
          bookings: state.bookings.map((b) => (b.id === id ? { ...b, status } : b)),
        })),

      confirmEndBooking: (id) => {
        const booking = get().getBookingById(id);
        if (!booking || booking.status !== 'active') return;

        const actualEndTime = formatTime(new Date());
        const spot = useParkingStore.getState().getSpotById(booking.spotId);
        const actualCost = spot
          ? calculateCost(booking.startTime, actualEndTime, spot.pricePerHour)
          : booking.totalCost;

        useWalletStore.getState().processPayment(
          booking.renterId,
          booking.ownerId,
          actualCost,
          `车位${booking.spotNumber}停车费`
        );

        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === id ? { ...b, status: 'completed', actualEndTime, totalCost: actualCost } : b
          ),
        }));
      },

      getBookingsByRenter: (renterId) =>
        get().bookings.filter((b) => b.renterId === renterId),

      getBookingsByOwner: (ownerId) =>
        get().bookings.filter((b) => b.ownerId === ownerId),

      getBookingById: (id) => get().bookings.find((b) => b.id === id),

      markReviewed: (bookingId, byRenter) =>
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId
              ? byRenter
                ? { ...b, reviewedByRenter: true }
                : { ...b, reviewedByOwner: true }
              : b
          ),
        })),
    }),
    { name: 'booking-storage' }
  )
);
