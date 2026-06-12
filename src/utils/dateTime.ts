export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month}月${day}日 ${hours}:${minutes}`;
}

export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dateOnly = formatDate(date);
  const todayOnly = formatDate(today);
  const tomorrowOnly = formatDate(tomorrow);

  if (dateOnly === todayOnly) return "今天";
  if (dateOnly === tomorrowOnly) return "明天";

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${month}月${day}日 ${weekdays[date.getDay()]}`;
}

export function calculateHours(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  let startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  const diffMinutes = endMinutes - startMinutes;
  return Math.ceil(diffMinutes / 60);
}

export function isTimeInRange(
  time: string,
  start: string,
  end: string,
): boolean {
  const [tH, tM] = time.split(":").map(Number);
  const [sH, sM] = start.split(":").map(Number);
  const [eH, eM] = end.split(":").map(Number);

  const tMin = tH * 60 + tM;
  const sMin = sH * 60 + sM;
  const eMin = eH * 60 + eM;

  if (eMin > sMin) {
    return tMin >= sMin && tMin < eMin;
  }
  return tMin >= sMin || tMin < eMin;
}

export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = String(h).padStart(2, "0");
      const minute = String(m).padStart(2, "0");
      slots.push(`${hour}:${minute}`);
    }
  }
  return slots;
}

export function generateNextDays(count: number): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(formatDate(date));
  }
  return days;
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function doTimeRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string,
): boolean {
  const [s1H, s1M] = start1.split(":").map(Number);
  const [e1H, e1M] = end1.split(":").map(Number);
  const [s2H, s2M] = start2.split(":").map(Number);
  const [e2H, e2M] = end2.split(":").map(Number);

  let s1 = s1H * 60 + s1M;
  let e1 = e1H * 60 + e1M;
  let s2 = s2H * 60 + s2M;
  let e2 = e2H * 60 + e2M;

  if (e1 <= s1) e1 += 24 * 60;
  if (e2 <= s2) e2 += 24 * 60;

  return s1 < e2 && s2 < e1;
}

export function isTimeRangeWithin(
  targetStart: string,
  targetEnd: string,
  slotStart: string,
  slotEnd: string,
): boolean {
  const [tsH, tsM] = targetStart.split(":").map(Number);
  const [teH, teM] = targetEnd.split(":").map(Number);
  const [ssH, ssM] = slotStart.split(":").map(Number);
  const [seH, seM] = slotEnd.split(":").map(Number);

  let ts = tsH * 60 + tsM;
  let te = teH * 60 + teM;
  let ss = ssH * 60 + ssM;
  let se = seH * 60 + seM;

  if (te <= ts) te += 24 * 60;
  if (se <= ss) se += 24 * 60;

  return ts >= ss && te <= se;
}
