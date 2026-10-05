const todayKey = () => new Date().toISOString().slice(0, 10);

const shift = (key, days) => {
  const d = new Date(`${key}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

export function calculateStreak(dates, today = todayKey()) {
  const set = new Set(dates);
  if (set.size === 0) return 0;

  const latest = [...set].sort().at(-1);
  if (latest < shift(today, -1)) return 0;

  let streak = 0;
  let day = latest;
  while (set.has(day)) {
    streak += 1;
    day = shift(day, -1);
  }
  return streak;
}

export function calculateLongestStreak(dates) {
  const sorted = [...new Set(dates)].sort();
  let longest = 0;
  let current = 0;
  let previous = null;

  for (const day of sorted) {
    current = previous && shift(previous, 1) === day ? current + 1 : 1;
    longest = Math.max(longest, current);
    previous = day;
  }
  return longest;
}