import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types';
import { mockUsers } from '@/utils/mockData';

interface UserState {
  currentUser: User;
  users: User[];
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  getUserById: (id: string) => User | undefined;
  updateUserCredit: (userId: string, rating: number) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: mockUsers.find((u) => u.id === 'user-current') || mockUsers[0],
      users: mockUsers,

      setCurrentUser: (user) => set({ currentUser: user }),

      switchRole: (role) =>
        set((state) => ({
          currentUser: { ...state.currentUser, role },
        })),

      getUserById: (id) => get().users.find((u) => u.id === id),

      updateUserCredit: (userId, rating) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  reviewCount: u.reviewCount + 1,
                  creditScore:
                    Math.round(
                      ((u.creditScore * u.reviewCount + rating) / (u.reviewCount + 1)) * 10
                    ) / 10,
                }
              : u
          ),
          currentUser:
            state.currentUser.id === userId
              ? {
                  ...state.currentUser,
                  reviewCount: state.currentUser.reviewCount + 1,
                  creditScore:
                    Math.round(
                      ((state.currentUser.creditScore * state.currentUser.reviewCount + rating) /
                        (state.currentUser.reviewCount + 1)) *
                        10
                    ) / 10,
                }
              : state.currentUser,
        })),
    }),
    { name: 'user-storage' }
  )
);
