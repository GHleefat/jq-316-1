import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Review } from '@/types';
import { mockReviews } from '@/utils/mockData';
import { generateId } from '@/utils/calculations';
import { nowISO } from '@/utils/dateTime';
import { useUserStore } from './useUserStore';
import { useBookingStore } from './useBookingStore';
import { useParkingStore } from './useParkingStore';

interface ReviewState {
  reviews: Review[];
  addReview: (
    bookingId: string,
    toUserId: string,
    rating: number,
    comment: string
  ) => void;
  getReviewsByUser: (userId: string) => Review[];
  getReviewsByBooking: (bookingId: string) => Review[];
  getReviewsForSpot: (spotId: string) => Review[];
}

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      reviews: mockReviews,

      addReview: (bookingId, toUserId, rating, comment) => {
        const currentUser = useUserStore.getState().currentUser;
        const booking = useBookingStore.getState().getBookingById(bookingId);

        if (!booking) return;

        const review: Review = {
          id: generateId('review-'),
          bookingId,
          fromUserId: currentUser.id,
          toUserId,
          rating,
          comment,
          createdAt: nowISO(),
          fromUserName: currentUser.name,
        };

        set((state) => ({ reviews: [review, ...state.reviews] }));

        useUserStore.getState().updateUserCredit(toUserId, rating);
        useParkingStore.getState().updateSpotRating(booking.spotId, rating);

        if (booking.renterId === currentUser.id) {
          useBookingStore.getState().markReviewed(bookingId, true);
        } else {
          useBookingStore.getState().markReviewed(bookingId, false);
        }
      },

      getReviewsByUser: (userId) =>
        get()
          .reviews.filter((r) => r.toUserId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

      getReviewsByBooking: (bookingId) =>
        get().reviews.filter((r) => r.bookingId === bookingId),

      getReviewsForSpot: (spotId) => {
        const bookings = useBookingStore.getState().bookings.filter((b) => b.spotId === spotId);
        const bookingIds = bookings.map((b) => b.id);
        return get()
          .reviews.filter((r) => bookingIds.includes(r.bookingId))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },
    }),
    { name: 'review-storage' }
  )
);
