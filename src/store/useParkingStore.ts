import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ParkingSpot, AvailableDate, TimeSlot, FilterOptions } from '@/types';
import { mockParkingSpots } from '@/utils/mockData';
import { isTimeInRange } from '@/utils/dateTime';
import { generateId } from '@/utils/calculations';

interface ParkingState {
  spots: ParkingSpot[];
  addSpot: (
    spot: Omit<ParkingSpot, 'id' | 'status' | 'avgRating' | 'reviewCount' | 'coverImage'>
  ) => void;
  updateSpot: (id: string, updates: Partial<ParkingSpot>) => void;
  removeSpot: (id: string) => void;
  toggleSpotStatus: (id: string) => void;
  getSpotById: (id: string) => ParkingSpot | undefined;
  getSpotsByOwner: (ownerId: string) => ParkingSpot[];
  filterSpots: (filters: FilterOptions) => ParkingSpot[];
  isSpotAvailable: (spotId: string, date: string, startTime: string, endTime: string) => boolean;
  updateSpotRating: (spotId: string, rating: number) => void;
}

export const useParkingStore = create<ParkingState>()(
  persist(
    (set, get) => ({
      spots: mockParkingSpots,

      addSpot: (spot) =>
        set((state) => ({
          spots: [
            ...state.spots,
            {
              ...spot,
              id: generateId('spot-'),
              status: 'active',
              avgRating: 0,
              reviewCount: 0,
            },
          ],
        })),

      updateSpot: (id, updates) =>
        set((state) => ({
          spots: state.spots.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),

      removeSpot: (id) =>
        set((state) => ({
          spots: state.spots.filter((s) => s.id !== id),
        })),

      toggleSpotStatus: (id) =>
        set((state) => ({
          spots: state.spots.map((s) =>
            s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
          ),
        })),

      getSpotById: (id) => get().spots.find((s) => s.id === id),

      getSpotsByOwner: (ownerId) => get().spots.filter((s) => s.ownerId === ownerId),

      filterSpots: (filters) => {
        const { date, startTime, endTime, minPrice, maxPrice } = filters;
        return get().spots.filter((spot) => {
          if (spot.status !== 'active') return false;
          if (spot.pricePerHour < minPrice || spot.pricePerHour > maxPrice) return false;

          if (date && startTime && endTime) {
            const dateData = spot.availableDates.find((d) => d.date === date);
            if (!dateData) return false;

            const hasOverlap = dateData.slots.some(
              (slot) =>
                isTimeInRange(startTime, slot.startTime, slot.endTime) &&
                isTimeInRange(endTime, slot.startTime, slot.endTime)
            );
            if (!hasOverlap) return false;
          }

          return true;
        });
      },

      isSpotAvailable: (spotId, date, startTime, endTime) => {
        const spot = get().getSpotById(spotId);
        if (!spot) return false;

        const dateData = spot.availableDates.find((d) => d.date === date);
        if (!dateData) return false;

        return dateData.slots.some(
          (slot) =>
            isTimeInRange(startTime, slot.startTime, slot.endTime) &&
            isTimeInRange(endTime, slot.startTime, slot.endTime)
        );
      },

      updateSpotRating: (spotId, rating) =>
        set((state) => ({
          spots: state.spots.map((s) =>
            s.id === spotId
              ? {
                  ...s,
                  reviewCount: s.reviewCount + 1,
                  avgRating:
                    Math.round(
                      ((s.avgRating * s.reviewCount + rating) / (s.reviewCount + 1)) * 10
                    ) / 10,
                }
              : s
          ),
        })),
    }),
    { name: 'parking-storage' }
  )
);
