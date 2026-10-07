import { useState } from 'react';
import { Check, Flame, Pen, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useHabits } from '../context/habitContext';
import { getErrorMessage } from '../utils/errors';
import { getTextColor } from '../utils/colors';
import { getLocalDateString } from '../utils/dates';

export default function Habit({ habit, onEdit , onShowStats}) {
  const { removeHabit, toggleToday, stats } = useHabits();
  const [busy, setBusy] = useState(false);

   const total = stats[habit.id]?.totalCheckIns;
   const doneToday = habit.lastCheckIn === getLocalDateString();

  async function handleToggle() {
    if (busy) {
      return;
    }

    setBusy(true);

    try {
      const nowDone = await toggleToday(habit);
      toast.success(nowDone ? 'Für heute abgehakt' : 'Check-in zurückgenommen');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

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
  
   function handleKeyDown(event) {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  }

  function stop(action) {
    return (event) => {
      event.stopPropagation();
      action();
    };
  }


  return (
    <div
      tabIndex={0}
      title={doneToday ? 'Antippen, um den Check-in zurückzunehmen' : 'Antippen zum Abhaken'}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={`w-full max-w-xs sm:max-w-sm md:max-w-md lg:w-52 xl:w-56 rounded-lg border border-slate-200 p-3 sm:p-4 flex flex-col gap-2 relative cursor-pointer select-none ${
        doneToday ? 'border-black/40 ring-2 ring-black/30' : 'border-slate-200'
      } ${busy ? 'opacity-70' : ''}`}
      style={{ backgroundColor: habit.color, color: getTextColor(habit.color) }}
    >
      <div className="absolute top-2 right-2 flex gap-1">
        <button
          type="button"
          aria-label="Habit bearbeiten"
          className="w-6 h-6 flex items-center justify-center"
          onClick={stop(() => onEdit(habit))}
        >
          <Pen size={15} />
        </button>
        <button
          type="button"
          aria-label="Habit löschen"
          className="w-6 h-6 flex items-center justify-center"
          onClick={stop(handleDelete)}
        >
          <X size={15} />
        </button>
      </div>

      <h2 className="text-xl font-semibold pt-2 pr-12 break-words">{habit.name}</h2>

      {habit.description ? <p className="text-sm break-words">{habit.description}</p> : null}

       <p className="text-sm flex items-center gap-1">
        {doneToday ? (
          <>
            <Check size={16} /> Heute erledigt
          </>
        ) : (
          'Heute noch offen'
        )}
      </p>


      <div className="mt-auto pt-2 border-t border-black/10">
        <div className="flex justify-between items-center">
            <div>
            <span className="text-lg font-bold">{total ?? '–'}</span>
            <span className="text-xs"> Check-ins</span>
            </div>
            <div className="flex items-center gap-1 font-bold">
                 <Flame size={18} />
                 {habit.streak}
            </div>
            </div>

            <button
          type="button"
          onClick={stop(() => onShowStats(habit.id))}
          className="mt-2 w-full p-1 border border-current rounded-md text-sm"
        >
          Statistik
        </button>
      </div>
    </div>
  );
}