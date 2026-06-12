import { useParkingStore } from '@/store/useParkingStore';
import { useUserStore } from '@/store/useUserStore';
import { useBookingStore } from '@/store/useBookingStore';
import { MapPin, Star, Calendar, Clock, ToggleLeft, ToggleRight, Trash2, Eye } from 'lucide-react';
import StarRating from '@/components/UI/StarRating';
import Empty from '@/components/UI/Empty';
import { useNavigate } from 'react-router-dom';
import { formatDisplayDate } from '@/utils/dateTime';

export default function MySpotsPage() {
  const navigate = useNavigate();
  const { currentUser } = useUserStore();
  const { getSpotsByOwner, toggleSpotStatus, removeSpot } = useParkingStore();
  const { getBookingsByOwner } = useBookingStore();

  const spots = getSpotsByOwner(currentUser.id);
  const bookings = getBookingsByOwner(currentUser.id);

  const getSpotBookingsCount = (spotId: string) =>
    bookings.filter((b) => b.spotId === spotId).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">我的车位</h1>
          <p className="text-slate-500 text-sm">
            管理您发布的车位，共 {spots.length} 个
          </p>
        </div>
        <button onClick={() => navigate('/publish')} className="btn btn-primary">
          发布新村位
        </button>
      </div>

      {spots.length === 0 ? (
        <Empty
          icon={<MapPin size={48} />}
          title="您还没有发布车位"
          description="发布您的空闲车位，赚取额外收入"
          action={
            <button onClick={() => navigate('/publish')} className="btn btn-primary">
              立即发布
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spots.map((spot) => (
            <div key={spot.id} className="card overflow-hidden animate-slide-up">
              <div className="relative h-36 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                {spot.coverImage ? (
                  <img
                    src={spot.coverImage}
                    alt={spot.spotNumber}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin size={48} className="text-slate-300" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="badge bg-white/90 backdrop-blur text-primary-700 font-semibold">
                    {spot.spotNumber}
                  </span>
                  <span
                    className={`badge ${
                      spot.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {spot.status === 'active' ? '上架中' : '已下架'}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-white/90 backdrop-blur rounded-lg px-2.5 py-1">
                    <span className="text-lg font-bold text-accent-600">
                      ¥{spot.pricePerHour}
                    </span>
                    <span className="text-xs text-slate-500 ml-0.5">/时</span>
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-600">{spot.building}</span>
                </div>

                <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                  {spot.description || '暂无描述'}
                </p>

                {spot.availableDates.length > 0 && (
                  <div className="flex items-start gap-2 mb-3">
                    <Calendar size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {spot.availableDates.slice(0, 3).map((d) => (
                        <span
                          key={d.date}
                          className="text-xs px-2 py-0.5 rounded bg-primary-50 text-primary-700"
                        >
                          {formatDisplayDate(d.date)}
                        </span>
                      ))}
                      {spot.availableDates.length > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                          +{spot.availableDates.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <StarRating rating={spot.avgRating} readonly size={14} showValue />
                    </div>
                    <span className="text-xs text-slate-400">
                      {getSpotBookingsCount(spot.id)} 笔订单
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleSpotStatus(spot.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        spot.status === 'active'
                          ? 'text-primary-600 hover:bg-primary-50'
                          : 'text-slate-400 hover:bg-slate-100'
                      }`}
                      title={spot.status === 'active' ? '下架' : '上架'}
                    >
                      {spot.status === 'active' ? (
                        <ToggleRight size={20} />
                      ) : (
                        <ToggleLeft size={20} />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('确定删除这个车位吗？')) {
                          removeSpot(spot.id);
                        }
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="删除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
