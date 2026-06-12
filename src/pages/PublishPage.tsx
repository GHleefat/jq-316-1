import { useState } from 'react';
import { MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useParkingStore } from '@/store/useParkingStore';
import { useUserStore } from '@/store/useUserStore';
import { TimeSlot, AvailableDate } from '@/types';
import { generateNextDays, formatDisplayDate } from '@/utils/dateTime';
import { useNavigate } from 'react-router-dom';

export default function PublishPage() {
  const navigate = useNavigate();
  const { addSpot } = useParkingStore();
  const { currentUser } = useUserStore();
  const nextDays = generateNextDays(7);

  const [spotNumber, setSpotNumber] = useState('');
  const [building, setBuilding] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerHour, setPricePerHour] = useState(5);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [slots, setSlots] = useState<TimeSlot[]>([
    { startTime: '08:00', endTime: '18:00' },
  ]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const toggleDate = (date: string) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  const addSlot = () => {
    setSlots([...slots, { startTime: '09:00', endTime: '17:00' }]);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: keyof TimeSlot, value: string) => {
    setSlots(
      slots.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot))
    );
  };

  const handleSubmit = () => {
    setError('');
    if (!spotNumber.trim()) {
      setError('请输入车位编号');
      return;
    }
    if (!building.trim()) {
      setError('请输入楼栋位置');
      return;
    }
    if (selectedDates.size === 0) {
      setError('请选择可租日期');
      return;
    }
    if (slots.length === 0) {
      setError('请添加至少一个可租时段');
      return;
    }

    const availableDates: AvailableDate[] = Array.from(selectedDates).map(
      (date) => ({
        date,
        slots: [...slots],
      })
    );

    addSpot({
      ownerId: currentUser.id,
      spotNumber: spotNumber.trim(),
      building: building.trim(),
      description: description.trim(),
      pricePerHour,
      availableDates,
    });

    setSuccess(true);
  };

  const resetForm = () => {
    setSpotNumber('');
    setBuilding('');
    setDescription('');
    setPricePerHour(5);
    setSelectedDates(new Set());
    setSlots([{ startTime: '08:00', endTime: '18:00' }]);
    setSuccess(false);
    setError('');
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            车位发布成功！
          </h2>
          <p className="text-slate-500 mb-6">
            您的车位已成功发布，邻居们现在可以看到并预约了
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={resetForm} className="btn btn-outline">
              继续发布
            </button>
            <button
              onClick={() => navigate('/my-spots')}
              className="btn btn-primary"
            >
              查看我的车位
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">发布车位</h1>
        <p className="text-slate-500 text-sm">
          分享您的空闲车位，帮助邻居的同时获得收益
        </p>
      </div>

      <div className="card p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">车位编号</label>
            <div className="relative">
              <MapPin
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={spotNumber}
                onChange={(e) => setSpotNumber(e.target.value)}
                placeholder="例如：A-101"
                className="input pl-10"
              />
            </div>
          </div>
          <div>
            <label className="label">楼栋位置</label>
            <input
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              placeholder="例如：1号楼地下"
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="label">车位描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="描述车位特点，如：靠近电梯口、有充电桩、适合SUV等"
            rows={3}
            className="input resize-none"
          />
        </div>

        <div>
          <label className="label">小时单价（元）</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={20}
              step={1}
              value={pricePerHour}
              onChange={(e) => setPricePerHour(Number(e.target.value))}
              className="flex-1 accent-primary-600"
            />
            <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-lg font-bold text-lg min-w-[80px] text-center">
              ¥{pricePerHour}
            </div>
          </div>
        </div>

        <div>
          <label className="label">可租日期</label>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
            {nextDays.map((d) => {
              const selected = selectedDates.has(d);
              return (
                <button
                  key={d}
                  onClick={() => toggleDate(d)}
                  className={`py-3 px-1 rounded-xl text-xs font-medium transition-all border-2 ${
                    selected
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-transparent bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {formatDisplayDate(d)}
                </button>
              );
            })}
          </div>
          {selectedDates.size > 0 && (
            <p className="text-xs text-slate-500 mt-2">
              已选择 {selectedDates.size} 天
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">可租时段</label>
            <button
              onClick={addSlot}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <Plus size={16} />
              添加时段
            </button>
          </div>
          <div className="space-y-3">
            {slots.map((slot, index) => (
              <div key={index} className="flex items-center gap-3">
                <select
                  value={slot.startTime}
                  onChange={(e) =>
                    updateSlot(index, 'startTime', e.target.value)
                  }
                  className="input flex-1"
                >
                  {Array.from({ length: 24 }, (_, h) => (
                    <option
                      key={h}
                      value={`${String(h).padStart(2, '0')}:00`}
                    >
                      {String(h).padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
                <span className="text-slate-400">至</span>
                <select
                  value={slot.endTime}
                  onChange={(e) =>
                    updateSlot(index, 'endTime', e.target.value)
                  }
                  className="input flex-1"
                >
                  {Array.from({ length: 24 }, (_, h) => (
                    <option
                      key={h}
                      value={`${String(h).padStart(2, '0')}:00`}
                    >
                      {String(h).padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
                {slots.length > 1 && (
                  <button
                    onClick={() => removeSlot(index)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <div className="pt-4 border-t border-slate-100">
          <button onClick={handleSubmit} className="w-full btn btn-primary text-base py-3">
            发布车位
          </button>
        </div>
      </div>
    </div>
  );
}
