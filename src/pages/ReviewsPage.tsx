import { useUserStore } from '@/store/useUserStore';
import { useReviewStore } from '@/store/useReviewStore';
import { MessageSquare, Star, User as UserIcon } from 'lucide-react';
import StarRating from '@/components/UI/StarRating';
import Empty from '@/components/UI/Empty';
import { formatDateTime } from '@/utils/dateTime';

export default function ReviewsPage() {
  const { currentUser } = useUserStore();
  const { getReviewsByUser } = useReviewStore();

  const reviews = getReviewsByUser(currentUser.id);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">信用评价</h1>
        <p className="text-slate-500 text-sm">查看您的信用评分和历史评价</p>
      </div>

      <div className="card p-6 md:p-8 mb-6 bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold border-2 border-white">
              {currentUser.reviewCount}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-bold text-slate-800 mb-1">
              {currentUser.name}
            </h2>
            <p className="text-sm text-slate-500 mb-3">{currentUser.building}</p>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <StarRating
                rating={currentUser.creditScore}
                readonly
                size={24}
                showValue
              />
              <span className="text-sm text-slate-400 ml-2">
                （基于 {currentUser.reviewCount} 条评价）
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center w-full md:w-auto">
            <div className="p-3">
              <div className="text-2xl font-bold text-primary-600">
                {reviews.filter((r) => r.rating === 5).length}
              </div>
              <div className="text-xs text-slate-500">五星好评</div>
            </div>
            <div className="p-3 border-x border-slate-200">
              <div className="text-2xl font-bold text-accent-600">
                {reviews.filter((r) => r.rating >= 4 && r.rating < 5).length}
              </div>
              <div className="text-xs text-slate-500">四星</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-bold text-slate-600">
                {reviews.filter((r) => r.rating < 4).length}
              </div>
              <div className="text-xs text-slate-500">三星及以下</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <MessageSquare size={20} className="text-primary-600" />
          收到的评价
        </h3>

        {reviews.length === 0 ? (
          <Empty
            icon={<MessageSquare size={48} />}
            title="暂无评价"
            description="完成订单后，对方可以给您评价"
          />
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="card p-5 animate-slide-up">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <UserIcon size={20} className="text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">
                          {review.fromUserName || '匿名用户'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDateTime(review.createdAt)}
                        </span>
                      </div>
                      <StarRating rating={review.rating} readonly size={14} />
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {review.comment || '用户未填写评价内容'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
