import { Flame, Pen, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useHabits } from '../context/habitContext';
import { getErrorMessage } from '../utils/errors';
import { getTextColor } from '../utils/colors';

export default function Habit({ habit, onEdit }) {
  const { removeHabit } = useHabits();

  async function handleDelete() {
    const confirmed = window.confirm(
      `Habit „${habit.name}“ wirklich löschen? Alle Check-ins gehen verloren.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeHabit(habit.id);
      toast.success(`„${habit.name}“ wurde gelöscht`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div
      className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:w-52 xl:w-56 rounded-lg border border-slate-200 p-3 sm:p-4 flex flex-col gap-2 relative"
      style={{ backgroundColor: habit.color, color: getTextColor(habit.color) }}
    >
      <div className="absolute top-2 right-2 flex gap-1">
        <button
          type="button"
          aria-label="Habit bearbeiten"
          className="w-6 h-6 flex items-center justify-center"
          onClick={() => onEdit(habit)}
        >
          <Pen size={15} />
        </button>
        <button
          type="button"
          aria-label="Habit löschen"
          className="w-6 h-6 flex items-center justify-center"
          onClick={handleDelete}
        >
          <X size={15} />
        </button>
      </div>

      <h2 className="text-xl font-semibold pt-2 pr-12 break-words">{habit.name}</h2>

      {habit.description ? <p className="text-sm break-words">{habit.description}</p> : null}

      <div className="mt-auto pt-2 border-t border-black/10">
        <div className="flex items-center gap-1 text-lg font-bold">
          <Flame size={18} />
          {habit.streak}
          <span className="text-sm font-normal">{habit.streak === 1 ? 'Tag' : 'Tage'}</span>
        </div>
      </div>
    </div>
  );
}