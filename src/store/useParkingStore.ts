import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ParkingSpot, AvailableDate, TimeSlot, FilterOptions } from "@/types";
import { mockParkingSpots } from "@/utils/mockData";
import {
  isTimeRangeWithin,
  doTimeRangesOverlap,
  isTimeInRange,
} from "@/utils/dateTime";
import { generateId } from "@/utils/calculations";
import { useBookingStore } from "./useBookingStore";

interface ParkingState {
  spots: ParkingSpot[];
  addSpot: (
    spot: Omit<
      ParkingSpot,
      "id" | "status" | "avgRating" | "reviewCount" | "coverImage"
    >,
  ) => void;
  updateSpot: (id: string, updates: Partial<ParkingSpot>) => void;
  removeSpot: (id: string) => void;
  toggleSpotStatus: (id: string) => void;
  getSpotById: (id: string) => ParkingSpot | undefined;
  getSpotsByOwner: (ownerId: string) => ParkingSpot[];
  filterSpots: (filters: FilterOptions) => ParkingSpot[];
  isSpotAvailable: (
    spotId: string,
    date: string,
    startTime: string,
    endTime: string,
  ) => boolean;
  getOccupiedSlots: (spotId: string, date: string) => TimeSlot[];
  getAvailableSlotsOnDate: (spotId: string, date: string) => TimeSlot[];
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
              id: generateId("spot-"),
              status: "active",
              avgRating: 0,
              reviewCount: 0,
            },
          ],
        })),

      updateSpot: (id, updates) =>
        set((state) => ({
          spots: state.spots.map((s) =>
            s.id === id ? { ...s, ...updates } : s,
          ),
        })),

      removeSpot: (id) =>
        set((state) => ({
          spots: state.spots.filter((s) => s.id !== id),
        })),

      toggleSpotStatus: (id) =>
        set((state) => ({
          spots: state.spots.map((s) =>
            s.id === id
              ? { ...s, status: s.status === "active" ? "inactive" : "active" }
              : s,
          ),
        })),

      getSpotById: (id) => get().spots.find((s) => s.id === id),

      getSpotsByOwner: (ownerId) =>
        get().spots.filter((s) => s.ownerId === ownerId),

      filterSpots: (filters) => {
        const { date, startTime, endTime, minPrice, maxPrice } = filters;
        const { getConflictingBookings } = useBookingStore.getState();
        return get().spots.filter((spot) => {
          if (spot.status !== "active") return false;
          if (spot.pricePerHour < minPrice || spot.pricePerHour > maxPrice)
            return false;

          if (date && startTime && endTime) {
            const dateData = spot.availableDates.find((d) => d.date === date);
            if (!dateData) return false;

            const withinAvailableSlot = dateData.slots.some((slot) =>
              isTimeRangeWithin(
                startTime,
                endTime,
                slot.startTime,
                slot.endTime,
              ),
            );
            if (!withinAvailableSlot) return false;

            const conflicts = getConflictingBookings(
              spot.id,
              date,
              startTime,
              endTime,
            );
            if (conflicts.length > 0) return false;
          }

          return true;
        });
      },

      isSpotAvailable: (spotId, date, startTime, endTime) => {
        const spot = get().getSpotById(spotId);
        if (!spot) return false;

        const dateData = spot.availableDates.find((d) => d.date === date);
        if (!dateData) return false;

        const withinSlot = dateData.slots.some((slot) =>
          isTimeRangeWithin(startTime, endTime, slot.startTime, slot.endTime),
        );
        if (!withinSlot) return false;

        const { getConflictingBookings } = useBookingStore.getState();
        const conflicts = getConflictingBookings(
          spotId,
          date,
          startTime,
          endTime,
        );
        return conflicts.length === 0;
      },

      getOccupiedSlots: (spotId, date) => {
        const bookings = useBookingStore.getState().bookings;
        return bookings
          .filter(
            (b) =>
              b.spotId === spotId &&
              b.date === date &&
              (b.status === "pending" || b.status === "active"),
          )
          .map((b) => ({ startTime: b.startTime, endTime: b.endTime }));
      },

      getAvailableSlotsOnDate: (spotId, date) => {
        const spot = get().getSpotById(spotId);
        if (!spot) return [];
        const dateData = spot.availableDates.find((d) => d.date === date);
        if (!dateData) return [];

        const occupied = get().getOccupiedSlots(spotId, date);

        const result: TimeSlot[] = [];
        for (const slot of dateData.slots) {
          let remaining: TimeSlot[] = [{ ...slot }];
          for (const occ of occupied) {
            const next: TimeSlot[] = [];
            for (const cur of remaining) {
              const toMinutes = (t: string) => {
                const [h, m] = t.split(":").map(Number);
                return h * 60 + m;
              };
              const curS = toMinutes(cur.startTime);
              const curE = toMinutes(cur.endTime);
              const occS = toMinutes(occ.startTime);
              const occE = toMinutes(occ.endTime);

              if (occE <= curS || occS >= curE) {
                next.push(cur);
              } else {
                if (occS > curS) {
                  next.push({
                    startTime: cur.startTime,
                    endTime: occ.startTime,
                  });
                }
                if (occE < curE) {
                  next.push({
                    startTime: occ.endTime,
                    endTime: cur.endTime,
                  });
                }
              }
            }
            remaining = next;
            if (remaining.length === 0) break;
          }
          result.push(...remaining);
        }
        return result;
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
                      ((s.avgRating * s.reviewCount + rating) /
                        (s.reviewCount + 1)) *
                        10,
                    ) / 10,
                }
              : s,
          ),
        })),
    }),
    { name: "parking-storage" },
  ),
);
