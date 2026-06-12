import { useState } from 'react';
import { useBookingStore } from '@/store/useBookingStore';
import { useUserStore } from '@/store/useUserStore';
import { useReviewStore } from '@/store/useReviewStore';
import { Booking, BookingStatus } from '@/types';
import {
  Clock,
  MapPin,
  CheckCircle,
  Star,
  Calendar,
  ClipboardList,
  Play,
} from 'lucide-react';
import { formatDisplayDate, formatDateTime } from '@/utils/dateTime';
import StarRating from '@/components/UI/StarRating';
import Modal from '@/components/UI/Modal';
import Empty from '@/components/UI/Empty';

const statusConfig: Record<
  BookingStatus,
  { label: string; className: string; dot: string }
> = {
  pending: {
    label: '待开始',
    className: 'bg-blue-50 text-blue-700',
    dot: 'bg-blue-500',
  },
  active: {
    label: '使用中',
    className: 'bg-green-50 text-green-700',
    dot: 'bg-green-500',
  },
  completed: {
    label: '已完成',
    className: 'bg-slate-100 text-slate-600',
    dot: 'bg-slate-400',
  },
  cancelled: {
    label: '已取消',
    className: 'bg-red-50 text-red-600',
    dot: 'bg-red-500',
  },
};

export default function OrdersPage() {
  const { currentUser } = useUserStore();
  const {
    getBookingsByRenter,
    getBookingsByOwner,
    updateBookingStatus,
    confirmEndBooking,
  } = useBookingStore();
  const { addReview } = useReviewStore();

  const [activeTab, setActiveTab] = useState<BookingStatus | 'all'>('all');
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);

  const allBookings =
    currentUser.role === 'owner'
      ? getBookingsByOwner(currentUser.id)
      : getBookingsByRenter(currentUser.id);

  const filteredBookings =
    activeTab === 'all'
      ? allBookings
      : allBookings.filter((b) => b.status === activeTab);

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'active', label: '使用中' },
    { key: 'pending', label: '待开始' },
    { key: 'completed', label: '已完成' },
  ] as const;

  const handleStart = (bookingId: string) => {
    updateBookingStatus(bookingId, 'active');
  };

  const handleEnd = (bookingId: string) => {
    confirmEndBooking(bookingId);
  };

  const handleOpenReview = (booking: Booking) => {
    setReviewBooking(booking);
    setReviewRating(5);
    setReviewComment('');
    setReviewOpen(true);
  };

  const handleSubmitReview = () => {
    if (!reviewBooking) return;
    const toUserId =
      currentUser.id === reviewBooking.renterId
        ? reviewBooking.ownerId
        : reviewBooking.renterId;
    addReview(reviewBooking.id, toUserId, reviewRating, reviewComment);
    setReviewOpen(false);
    setReviewBooking(null);
  };

  const canReview = (booking: Booking) => {
    if (booking.status !== 'completed') return false;
    return currentUser.role === 'renter'
      ? !booking.reviewedByRenter
      : !booking.reviewedByOwner;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">我的订单</h1>
        <p className="text-slate-500 text-sm">
          查看和管理您的车位预约记录
        </p>
      </div>

      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-slate-400">
              ({tab.key === 'all'
                ? allBookings.length
                : allBookings.filter((b) => b.status === tab.key).length})
            </span>
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <Empty
          icon={<ClipboardList size={48} />}
          title="暂无订单记录"
          description="去首页看看有没有合适的车位吧"
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const cfg = statusConfig[booking.status];
            return (
              <div key={booking.id} className="card overflow-hidden animate-slide-up">
                <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className={`badge ${cfg.className}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {formatDateTime(booking.createdAt)}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-800 text-lg">
                          {booking.spotNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <MapPin size={14} />
                        {booking.building}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-accent-600">
                        ¥{booking.totalCost.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl mb-4">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                        <Calendar size={12} />
                        日期
                      </div>
                      <div className="text-sm font-medium text-slate-700">
                        {formatDisplayDate(booking.date)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                        <Clock size={12} />
                        时段
                      </div>
                      <div className="text-sm font-medium text-slate-700">
                        {booking.startTime} - {booking.endTime}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        {currentUser.role === 'owner' ? '租客' : '业主'}
                      </div>
                      <div className="text-sm font-medium text-slate-700">
                        {currentUser.role === 'owner'
                          ? booking.renterName
                          : booking.ownerName}
                      </div>
                    </div>
                  </div>

                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleStart(booking.id)}
                      className="w-full btn btn-primary"
                    >
                      <Play size={16} />
                      开始使用
                    </button>
                  )}

                  {booking.status === 'active' && currentUser.role === 'renter' && (
                    <button
                      onClick={() => handleEnd(booking.id)}
                      className="w-full btn btn-accent"
                    >
                      <CheckCircle size={16} />
                      确认离场并结算
                    </button>
                  )}

                  {booking.status === 'completed' && canReview(booking) && (
                    <button
                      onClick={() => handleOpenReview(booking)}
                      className="w-full btn btn-outline"
                    >
                      <Star size={16} />
                      去评价
                    </button>
                  )}

                  {booking.status === 'completed' && !canReview(booking) && (
                    <div className="text-center py-2 text-sm text-green-600 font-medium">
                      ✓ 已评价
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title="发表评价"
        footer={
          <>
            <button onClick={() => setReviewOpen(false)} className="btn btn-outline">
              取消
            </button>
            <button onClick={handleSubmitReview} className="btn btn-primary">
              提交评价
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-slate-500 mb-3">
              您对这次体验满意吗？
            </p>
            <div className="flex justify-center">
              <StarRating
                rating={reviewRating}
                onRatingChange={setReviewRating}
                size={32}
              />
            </div>
          </div>

          <div>
            <label className="label">评价内容</label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="说说您的感受..."
              rows={4}
              className="input resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
