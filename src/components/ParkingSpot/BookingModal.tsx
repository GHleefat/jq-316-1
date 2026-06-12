import { useState, useMemo, useEffect } from "react";
import { ParkingSpot, TimeSlot } from "@/types";
import Modal from "@/components/UI/Modal";
import {
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  formatDate,
  generateNextDays,
  formatDisplayDate,
  generateTimeSlots,
  isTimeRangeWithin,
} from "@/utils/dateTime";
import { calculateCost } from "@/utils/calculations";
import { calculateHours } from "@/utils/dateTime";
import { useBookingStore } from "@/store/useBookingStore";
import { useWalletStore } from "@/store/useWalletStore";
import { useUserStore } from "@/store/useUserStore";
import { useParkingStore } from "@/store/useParkingStore";
import { useNavigate } from "react-router-dom";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  spot: ParkingSpot | null;
}

export default function BookingModal({
  open,
  onClose,
  spot,
}: BookingModalProps) {
  const today = formatDate(new Date());
  const nextDays = generateNextDays(7);
  const allTimeSlots = generateTimeSlots();

  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { createBooking } = useBookingStore();
  const { getBalance } = useWalletStore();
  const { currentUser } = useUserStore();
  const { isSpotAvailable, getOccupiedSlots } = useParkingStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    setDate(today);
    setStartTime("");
    setEndTime("");
    setError("");
    setSuccess(false);
  }, [open, today, spot?.id]);

  const rentableSlots = useMemo<TimeSlot[]>(() => {
    if (!spot) return [];
    const dateData = spot.availableDates.find((d) => d.date === date);
    return dateData?.slots || [];
  }, [spot, date]);

  const occupiedSlots = useMemo<TimeSlot[]>(() => {
    if (!spot) return [];
    return getOccupiedSlots(spot.id, date);
  }, [spot, date, getOccupiedSlots]);

  const availableStartTimes = useMemo(() => {
    return allTimeSlots.filter((t) =>
      rentableSlots.some(
        (slot) =>
          t >= slot.startTime &&
          t < slot.endTime &&
          !occupiedSlots.some((occ) => t >= occ.startTime && t < occ.endTime),
      ),
    );
  }, [rentableSlots, occupiedSlots, allTimeSlots]);

  const availableEndTimes = useMemo(() => {
    if (!startTime) return [];
    return allTimeSlots
      .filter((t) => t > startTime)
      .filter((t) => isSpotAvailable(spot?.id || "", date, startTime, t));
  }, [startTime, spot?.id, date, isSpotAvailable, allTimeSlots]);

  const estimatedCost = useMemo(() => {
    if (!spot || !startTime || !endTime) return 0;
    return calculateCost(startTime, endTime, spot.pricePerHour);
  }, [spot, startTime, endTime]);

  const hours = useMemo(() => {
    if (!startTime || !endTime) return 0;
    return calculateHours(startTime, endTime);
  }, [startTime, endTime]);

  const balance = getBalance(currentUser.id);

  const resetForm = () => {
    setDate(today);
    setStartTime("");
    setEndTime("");
    setError("");
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!spot || !date || !startTime || !endTime) {
      setError("请选择完整的预约时间");
      return;
    }

    const fitsRentable = rentableSlots.some((slot) =>
      isTimeRangeWithin(startTime, endTime, slot.startTime, slot.endTime),
    );
    if (!fitsRentable) {
      setError("所选时段不在该车位的可租时段内，请重新选择。");
      return;
    }

    if (!isSpotAvailable(spot.id, date, startTime, endTime)) {
      setError("该时段已被其他邻居预约，请选择其他时间。");
      return;
    }

    if (balance < estimatedCost) {
      setError(`余额不足，请先充值。当前余额：¥${balance.toFixed(2)}`);
      return;
    }

    const booking = createBooking(
      spot.id,
      date,
      startTime,
      endTime,
      spot.pricePerHour,
    );

    if (booking) {
      setSuccess(true);
    } else {
      setError("预约失败，时段可能已被占用，请刷新后重试。");
    }
  };

  const goToOrders = () => {
    handleClose();
    navigate("/orders");
  };

  if (!spot) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="预约车位"
      footer={
        success ? (
          <button onClick={goToOrders} className="btn btn-primary">
            查看订单
          </button>
        ) : (
          <>
            <button onClick={handleClose} className="btn btn-outline">
              取消
            </button>
            <button onClick={handleSubmit} className="btn btn-primary">
              确认预约
            </button>
          </>
        )
      }
    >
      {success ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            预约成功！
          </h3>
          <p className="text-sm text-slate-500">
            已为您锁定车位 {spot.spotNumber}，请按时到达
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
            <MapPin
              size={20}
              className="text-primary-600 mt-0.5 flex-shrink-0"
            />
            <div>
              <div className="font-semibold text-slate-800">
                {spot.spotNumber}
              </div>
              <div className="text-sm text-slate-500">{spot.building}</div>
              <div className="text-sm text-accent-600 font-medium mt-1">
                ¥{spot.pricePerHour}/小时
              </div>
            </div>
          </div>

          <div>
            <label className="label">预约日期</label>
            <div className="grid grid-cols-4 gap-2">
              {nextDays.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDate(d);
                    setStartTime("");
                    setEndTime("");
                  }}
                  className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                    date === d
                      ? "bg-primary-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {formatDisplayDate(d)}
                </button>
              ))}
            </div>
          </div>

          {rentableSlots.length === 0 ? (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-600 text-sm">
              <XCircle size={18} />
              该车位当日暂无可租时段，请选择其他日期。
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">开始时间</label>
                <select
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    setEndTime("");
                  }}
                  className="input"
                >
                  <option value="">请选择</option>
                  {availableStartTimes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">结束时间</label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="input"
                  disabled={!startTime}
                >
                  <option value="">请选择</option>
                  {availableEndTimes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {rentableSlots.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-start gap-2 p-3 bg-primary-50 rounded-xl">
                <Clock
                  size={18}
                  className="text-primary-600 mt-0.5 flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-primary-800 mb-1">
                    可租时段
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {rentableSlots.map((slot, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded bg-white text-primary-700 border border-primary-200"
                      >
                        {slot.startTime} - {slot.endTime}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {occupiedSlots.length > 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl">
                  <AlertCircle
                    size={18}
                    className="text-amber-600 mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-amber-800 mb-1">
                      已被预约
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {occupiedSlots.map((slot, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded bg-white text-amber-700 border border-amber-200"
                        >
                          {slot.startTime} - {slot.endTime}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-600 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {startTime && endTime && (
            <div className="p-4 bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl border border-accent-100">
              <div className="flex justify-between items-center text-sm text-slate-600 mb-2">
                <span>预计时长</span>
                <span className="font-medium">{hours} 小时</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700 font-medium">预估费用</span>
                <span className="text-2xl font-bold text-accent-600">
                  ¥{estimatedCost.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                当前余额：¥{balance.toFixed(2)}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
