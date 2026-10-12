export const todayKey = () => new Date().toISOString().slice(0, 10);

export function shiftDay(key, days) {
  const d = new Date(`${key}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function lastDays(count, end = todayKey()) {
  return Array.from({ length: count }, (_, index) => shiftDay(end, index - (count - 1)));
}