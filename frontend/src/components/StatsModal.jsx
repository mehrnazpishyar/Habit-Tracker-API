import { useEffect } from 'react';
import { Flame } from 'lucide-react';
import Calendar from './Calendar';
import { useHabits } from '../context/habitContext';

export default function StatsModal({ habitId, onClose }) {
  const { habits, stats } = useHabits();
  const habit = habits.find((item) => item.id === habitId);
  const entry = stats[habitId];

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!habit) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <header className="mb-6">
          <h1 className="text-2xl font-bold break-words">{habit.name}</h1>
          {habit.description ? <p className="text-lg break-words">{habit.description}</p> : null}
        </header>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="border rounded-lg p-3">
            <div className="text-xs mb-1">Check-ins gesamt</div>
            <div className="text-2xl font-bold">{entry?.totalCheckIns ?? '–'}</div>
          </div>

          <div className="border rounded-lg p-3">
            <div className="text-xs mb-1">Aktuelle Streak</div>
            <div className="text-2xl font-bold flex items-center gap-1">
              <Flame size={20} />
              {habit.streak}
            </div>
          </div>

          <div className="border rounded-lg p-3">
            <div className="text-xs mb-1">Längste Streak</div>
            <div className="text-2xl font-bold">{entry?.longestStreak ?? '–'}</div>
          </div>
        </div>

        <div className="mb-4">
          <Calendar habit={habit} />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold"
        >
          Schließen
        </button>
      </div>
    </div>
  );
}