import { useState, useMemo } from 'react';
import {
  MapPin,
  Calendar,
  Search,
  ClipboardList,
  Wallet as WalletIcon,
  ParkingCircle,
} from 'lucide-react';
import { useParkingStore } from '@/store/useParkingStore';
import { useBookingStore } from '@/store/useBookingStore';
import { useWalletStore } from '@/store/useWalletStore';
import { useUserStore } from '@/store/useUserStore';
import { ParkingSpot, FilterOptions } from '@/types';
import SpotCard from '@/components/ParkingSpot/SpotCard';
import BookingModal from '@/components/ParkingSpot/BookingModal';
import Empty from '@/components/UI/Empty';
import {
  formatDate,
  generateNextDays,
  formatDisplayDate,
} from '@/utils/dateTime';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const today = formatDate(new Date());
  const nextDays = generateNextDays(7);

  const [filters, setFilters] = useState<FilterOptions>({
    date: today,
    startTime: '',
    endTime: '',
    minPrice: 0,
    maxPrice: 20,
  });
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  const { spots, filterSpots, getSpotsByOwner } = useParkingStore();
  const { getBookingsByRenter, getBookingsByOwner } = useBookingStore();
  const { getBalance } = useWalletStore();
  const { currentUser } = useUserStore();
  const navigate = useNavigate();

  const filteredSpots = useMemo(() => {
    if (currentUser.role === 'owner') {
      return getSpotsByOwner(currentUser.id);
    }
    return filterSpots(filters);
  }, [filters, currentUser.role, spots]);

  const activeBookings =
    currentUser.role === 'owner'
      ? getBookingsByOwner(currentUser.id).filter((b) => b.status === 'active')
      : getBookingsByRenter(currentUser.id).filter((b) => b.status === 'active');

  const balance = getBalance(currentUser.id);

  const handleBook = (spot: ParkingSpot) => {
    setSelectedSpot(spot);
    setBookingOpen(true);
  };

  const stats = [
    {
      label: currentUser.role === 'owner' ? '我的车位' : '今日空闲车位',
      value:
        currentUser.role === 'owner'
          ? getSpotsByOwner(currentUser.id).length
          : spots.filter((s) => s.status === 'active').length,
      icon: ParkingCircle,
      color: 'from-primary-500 to-primary-700',
    },
    {
      label: '进行中订单',
      value: activeBookings.length,
      icon: ClipboardList,
      color: 'from-accent-500 to-accent-700',
      onClick: () => navigate('/orders'),
    },
    {
      label: '账户余额',
      value: `¥${balance.toFixed(2)}`,
      icon: WalletIcon,
      color: 'from-slate-600 to-slate-800',
      onClick: () => navigate('/wallet'),
    },
  ];

  return (
    <div className="space-y-6">
      {currentUser.role === 'renter' ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white p-6 md:p-8">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-primary-500/20" />
          <div className="absolute -right-10 bottom-0 w-40 h-40 rounded-full bg-accent-500/20" />
          <div className="relative">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              找到合适的车位
            </h1>
            <p className="text-primary-100 mb-6">
              共享邻里车位，让停车更简单
            </p>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex flex-col md:flex-row gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Calendar size={18} className="text-primary-200" />
                <div className="flex flex-wrap gap-1 flex-1 overflow-x-auto scrollbar-thin">
                  {nextDays.slice(0, 5).map((d) => (
                    <button
                      key={d}
                      onClick={() =>
                        setFilters((f) => ({ ...f, date: d }))
                      }
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                        filters.date === d
                          ? 'bg-white text-primary-700'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {formatDisplayDate(d)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-px md:h-auto md:w-px bg-white/20" />
              <div className="flex items-center gap-2 flex-1">
                <Search size={18} className="text-primary-200" />
                <input
                  type="range"
                  min={0}
                  max={20}
                  step={1}
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      maxPrice: Number(e.target.value),
                    }))
                  }
                  className="flex-1 accent-white"
                />
                <span className="text-sm font-medium whitespace-nowrap">
                  ¥{filters.maxPrice}/时以内
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-500 via-accent-600 to-accent-800 text-white p-6 md:p-8">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/10" />
          <div className="relative">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              分享您的车位
            </h1>
            <p className="text-accent-100 mb-4">
              闲置时段出租，轻松获得额外收入
            </p>
            <button
              onClick={() => navigate('/publish')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-accent-700 rounded-lg font-medium hover:bg-accent-50 transition-colors"
            >
              <MapPin size={18} />
              立即发布车位
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              onClick={stat.onClick}
              className={`card p-5 ${stat.onClick ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                >
                  <Icon size={22} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            {currentUser.role === 'owner' ? '我的车位' : '可预约车位'}
          </h2>
          <span className="text-sm text-slate-500">
            共 {filteredSpots.length} 个
          </span>
        </div>

        {filteredSpots.length === 0 ? (
          <Empty
            icon={<ParkingCircle size={48} />}
            title={currentUser.role === 'owner' ? '您还没有发布车位' : '暂无符合条件的车位'}
            description={
              currentUser.role === 'owner'
                ? '点击上方按钮发布您的第一个车位'
                : '试试调整筛选条件'
            }
            action={
              currentUser.role === 'owner' ? (
                <button
                  onClick={() => navigate('/publish')}
                  className="btn btn-primary"
                >
                  发布车位
                </button>
              ) : null
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSpots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} onBook={handleBook} />
            ))}
          </div>
        )}
      </div>

      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        spot={selectedSpot}
      />
    </div>
  );
}
