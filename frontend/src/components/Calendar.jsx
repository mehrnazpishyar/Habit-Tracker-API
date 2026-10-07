import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchCheckIns } from '../api/checkins';
import { getLocalDateString } from '../utils/dates';
import { WEEKDAYS, formatMonth, getMonthDays, getMonthRange } from '../utils/calendar';
import { getTextColor } from '../utils/colors';

export default function Calendar({ habit }) {
  const now = new Date();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [result, setResult] = useState({ key: '', dates: new Set(), failed: false });

  const key = `${habit.id}-${view.year}-${view.month}`;
  const loading = result.key !== key;
  const today = getLocalDateString();
  const isCurrentMonth = view.year === now.getFullYear() && view.month === now.getMonth();

  useEffect(() => {
    let cancelled = false;

    fetchCheckIns(habit.id, getMonthRange(view.year, view.month))
      .then((items) => {
        if (!cancelled) {
          setResult({ key, dates: new Set(items.map((item) => item.date)), failed: false });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResult({ key, dates: new Set(), failed: true });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [key, habit.id, view.year, view.month]);

  function shiftMonth(delta) {
    setView(({ year, month }) => {
      const next = new Date(year, month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          aria-label="Vorheriger Monat"
          onClick={() => shiftMonth(-1)}
          className="p-1 border rounded-md"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-semibold capitalize">{formatMonth(view.year, view.month)}</span>
        <button
          type="button"
          aria-label="Nächster Monat"
          onClick={() => shiftMonth(1)}
          disabled={isCurrentMonth}
          className="p-1 border rounded-md disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className={`grid grid-cols-7 gap-1 text-center ${loading ? 'opacity-50' : ''}`}>
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="text-xs font-semibold text-gray-500">
            {weekday}
          </div>
        ))}

        {getMonthDays(view.year, view.month).map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} />;
          }

          const completed = result.dates.has(date);

          return (
            <div
              key={date}
              style={
                completed ? { backgroundColor: habit.color, color: getTextColor(habit.color) } : undefined
              }
              className={`aspect-square flex items-center justify-center text-sm rounded border ${
                date === today ? 'ring-2 ring-gray-900' : ''
              }`}
            >
              {Number(date.slice(8))}
            </div>
          );
        })}
      </div>

      {result.failed && !loading && (
        <p className="text-sm text-red-600 mt-2">Der Kalender konnte nicht geladen werden.</p>
      )}
    </div>
  );
}