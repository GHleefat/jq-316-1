import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Wallet, Transaction, TransactionType } from '@/types';
import { mockWallets, mockTransactions } from '@/utils/mockData';
import { generateId } from '@/utils/calculations';
import { nowISO } from '@/utils/dateTime';

interface WalletState {
  wallets: Wallet[];
  transactions: Transaction[];
  getWalletByUserId: (userId: string) => Wallet | undefined;
  getTransactionsByWallet: (walletId: string) => Transaction[];
  getTransactionsByUser: (userId: string) => Transaction[];
  deposit: (userId: string, amount: number, description?: string) => void;
  processPayment: (
    renterId: string,
    ownerId: string,
    amount: number,
    description: string
  ) => boolean;
  getBalance: (userId: string) => number;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallets: mockWallets,
      transactions: mockTransactions,

      getWalletByUserId: (userId) => get().wallets.find((w) => w.userId === userId),

      getTransactionsByWallet: (walletId) =>
        get()
          .transactions.filter((t) => t.walletId === walletId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

      getTransactionsByUser: (userId) => {
        const wallet = get().getWalletByUserId(userId);
        if (!wallet) return [];
        return get().getTransactionsByWallet(wallet.id);
      },

      deposit: (userId, amount, description = '账户充值') => {
        const wallet = get().getWalletByUserId(userId);
        if (!wallet) {
          const newWallet: Wallet = {
            id: generateId('wallet-'),
            userId,
            balance: amount,
          };
          set((state) => ({ wallets: [...state.wallets, newWallet] }));
          wallet;
          const tx: Transaction = {
            id: generateId('tx-'),
            walletId: newWallet.id,
            type: 'deposit',
            amount,
            description,
            createdAt: nowISO(),
          };
          set((state) => ({ transactions: [tx, ...state.transactions] }));
          return;
        }

        set((state) => ({
          wallets: state.wallets.map((w) =>
            w.id === wallet.id ? { ...w, balance: w.balance + amount } : w
          ),
        }));

        const tx: Transaction = {
          id: generateId('tx-'),
          walletId: wallet.id,
          type: 'deposit',
          amount,
          description,
          createdAt: nowISO(),
        };
        set((state) => ({ transactions: [tx, ...state.transactions] }));
      },

      processPayment: (renterId, ownerId, amount, description) => {
        const renterWallet = get().getWalletByUserId(renterId);
        const ownerWallet = get().getWalletByUserId(ownerId);

        if (!renterWallet || renterWallet.balance < amount) return false;

        set((state) => ({
          wallets: state.wallets.map((w) => {
            if (w.id === renterWallet.id) return { ...w, balance: w.balance - amount };
            if (ownerWallet && w.id === ownerWallet.id) return { ...w, balance: w.balance + amount };
            return w;
          }),
        }));

        const paymentTx: Transaction = {
          id: generateId('tx-'),
          walletId: renterWallet.id,
          type: 'payment',
          amount: -amount,
          description,
          createdAt: nowISO(),
        };

        const newTransactions: Transaction[] = [paymentTx];

        if (ownerWallet) {
          const incomeTx: Transaction = {
            id: generateId('tx-'),
            walletId: ownerWallet.id,
            type: 'income',
            amount,
            description,
            createdAt: nowISO(),
          };
          newTransactions.push(incomeTx);
        }

        set((state) => ({
          transactions: [...newTransactions, ...state.transactions],
        }));

        return true;
      },

      getBalance: (userId) => {
        const wallet = get().getWalletByUserId(userId);
        return wallet?.balance ?? 0;
      },
    }),
    { name: 'wallet-storage' }
  )
);
