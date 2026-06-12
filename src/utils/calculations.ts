import { calculateHours } from './dateTime';

export function calculateCost(
  startTime: string,
  endTime: string,
  pricePerHour: number
): number {
  const hours = calculateHours(startTime, endTime);
  return Math.round(hours * pricePerHour * 100) / 100;
}

export function roundTo2Decimals(num: number): number {
  return Math.round(num * 100) / 100;
}

export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}${timestamp}${random}`;
}
