export type UserRole = 'owner' | 'renter';

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  creditScore: number;
  reviewCount: number;
  building: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface AvailableDate {
  date: string;
  slots: TimeSlot[];
}

export interface ParkingSpot {
  id: string;
  ownerId: string;
  spotNumber: string;
  building: string;
  description: string;
  pricePerHour: number;
  availableDates: AvailableDate[];
  status: 'active' | 'inactive';
  avgRating: number;
  reviewCount: number;
  coverImage?: string;
}

export type BookingStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  spotId: string;
  renterId: string;
  ownerId: string;
  date: string;
  startTime: string;
  endTime: string;
  actualEndTime?: string;
  totalCost: number;
  status: BookingStatus;
  createdAt: string;
  spotNumber?: string;
  building?: string;
  renterName?: string;
  ownerName?: string;
  reviewedByRenter?: boolean;
  reviewedByOwner?: boolean;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
}

export type TransactionType = 'deposit' | 'payment' | 'income';

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  description: string;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment: string;
  createdAt: string;
  fromUserName?: string;
}

export interface FilterOptions {
  date: string;
  startTime: string;
  endTime: string;
  minPrice: number;
  maxPrice: number;
}
