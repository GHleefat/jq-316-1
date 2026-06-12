import { ParkingSpot } from '@/types';
import { MapPin, Clock, Star } from 'lucide-react';
import StarRating from '@/components/UI/StarRating';

interface SpotCardProps {
  spot: ParkingSpot;
  onBook: (spot: ParkingSpot) => void;
}

export default function SpotCard({ spot, onBook }: SpotCardProps) {
  const ownerSlots = spot.availableDates[0]?.slots || [];

  return (
    <div className="card overflow-hidden group animate-slide-up">
      <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        {spot.coverImage ? (
          <img
            src={spot.coverImage}
            alt={spot.spotNumber}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin size={48} className="text-slate-300" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="badge bg-white/90 backdrop-blur text-primary-700 font-semibold">
            {spot.spotNumber}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <div className="bg-white/90 backdrop-blur rounded-lg px-2.5 py-1">
            <span className="text-xl font-bold text-accent-600">
              ¥{spot.pricePerHour}
            </span>
            <span className="text-xs text-slate-500 ml-0.5">/时</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-2 mb-2">
          <MapPin size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-slate-600">{spot.building}</span>
        </div>

        <p className="text-sm text-slate-500 mb-3 line-clamp-2 min-h-[40px]">
          {spot.description}
        </p>

        {ownerSlots.length > 0 && (
          <div className="flex items-start gap-2 mb-3">
            <Clock size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="flex flex-wrap gap-1">
              {ownerSlots.slice(0, 2).map((slot, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 rounded bg-primary-50 text-primary-700"
                >
                  {slot.startTime}-{slot.endTime}
                </span>
              ))}
              {ownerSlots.length > 2 && (
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                  +{ownerSlots.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <StarRating rating={spot.avgRating} readonly showValue size={14} />
          <span className="text-xs text-slate-400">
            {spot.reviewCount} 条评价
          </span>
        </div>

        <button
          onClick={() => onBook(spot)}
          className="w-full mt-3 btn btn-accent"
        >
          立即预约
        </button>
      </div>
    </div>
  );
}
