import { useState } from 'react';
import { Wallet as WalletIcon, Plus, ArrowDownLeft, ArrowUpRight, TrendingUp, CreditCard } from 'lucide-react';
import { useWalletStore } from '@/store/useWalletStore';
import { useUserStore } from '@/store/useUserStore';
import { Transaction, TransactionType } from '@/types';
import { formatDateTime } from '@/utils/dateTime';
import Modal from '@/components/UI/Modal';
import Empty from '@/components/UI/Empty';

const typeConfig: Record<
  TransactionType,
  { label: string; icon: typeof ArrowDownLeft; color: string; amountClass: string }
> = {
  deposit: {
    label: '充值',
    icon: ArrowDownLeft,
    color: 'bg-green-100 text-green-600',
    amountClass: 'text-green-600',
  },
  payment: {
    label: '支出',
    icon: ArrowUpRight,
    color: 'bg-red-100 text-red-600',
    amountClass: 'text-red-600',
  },
  income: {
    label: '收入',
    icon: TrendingUp,
    color: 'bg-primary-100 text-primary-600',
    amountClass: 'text-primary-600',
  },
};

export default function WalletPage() {
  const { getBalance, getTransactionsByUser, deposit } = useWalletStore();
  const { currentUser } = useUserStore();

  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(100);

  const balance = getBalance(currentUser.id);
  const transactions = getTransactionsByUser(currentUser.id);

  const rechargeOptions = [50, 100, 200, 500, 1000];

  const handleRecharge = () => {
    deposit(currentUser.id, rechargeAmount, '账户充值');
    setRechargeOpen(false);
  };

  const incomeTotal = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const paymentTotal = transactions
    .filter((t) => t.type === 'payment')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">我的钱包</h1>
        <p className="text-slate-500 text-sm">管理账户余额和交易记录</p>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white p-6 md:p-8 mb-6">
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute -right-10 bottom-0 w-40 h-40 rounded-full bg-accent-500/20" />
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-primary-100">
              <WalletIcon size={20} />
              <span className="text-sm">账户余额</span>
            </div>
            <CreditCard size={28} className="text-primary-200" />
          </div>
          <div className="text-5xl font-bold mb-6 tracking-tight">
            ¥{balance.toFixed(2)}
          </div>
          <button
            onClick={() => setRechargeOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary-700 rounded-lg font-medium hover:bg-primary-50 transition-colors"
          >
            <Plus size={18} />
            充值
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <TrendingUp size={16} className="text-primary-600" />
            累计收入
          </div>
          <div className="text-2xl font-bold text-primary-600">
            ¥{incomeTotal.toFixed(2)}
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <ArrowUpRight size={16} className="text-red-500" />
            累计支出
          </div>
          <div className="text-2xl font-bold text-slate-800">
            ¥{paymentTotal.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">交易记录</h2>
        </div>

        {transactions.length === 0 ? (
          <Empty
            icon={<WalletIcon size={48} />}
            title="暂无交易记录"
            description="充值或停车消费后会显示在这里"
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const cfg = typeConfig[tx.type];
              const Icon = cfg.icon;
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors animate-fade-in"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${cfg.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800">{cfg.label}</div>
                    <div className="text-sm text-slate-500 truncate">
                      {tx.description}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${cfg.amountClass}`}>
                      {tx.amount > 0 ? '+' : ''}
                      ¥{Math.abs(tx.amount).toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatDateTime(tx.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={rechargeOpen}
        onClose={() => setRechargeOpen(false)}
        title="账户充值"
        footer={
          <>
            <button onClick={() => setRechargeOpen(false)} className="btn btn-outline">
              取消
            </button>
            <button onClick={handleRecharge} className="btn btn-primary">
              确认充值 ¥{rechargeAmount}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">选择金额</label>
            <div className="grid grid-cols-3 gap-2">
              {rechargeOptions.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setRechargeAmount(amount)}
                  className={`py-3 rounded-xl text-lg font-bold transition-all border-2 ${
                    rechargeAmount === amount
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-transparent bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  ¥{amount}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">自定义金额</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                ¥
              </span>
              <input
                type="number"
                min={1}
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(Number(e.target.value))}
                className="input pl-8"
                placeholder="请输入金额"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-sm text-slate-500">
            <p>请选择充值方式：</p>
            <div className="flex gap-2 mt-2">
              <div className="flex-1 py-2 px-3 rounded-lg bg-white border border-slate-200 text-center font-medium text-slate-700">
                微信支付
              </div>
              <div className="flex-1 py-2 px-3 rounded-lg bg-white border border-slate-200 text-center font-medium text-slate-700">
                支付宝
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
