import Habit from './Habit';
import { useHabits } from '../context/habitContext';

export default function HabitGrid({ onEdit }) {
  const { habits } = useHabits();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 sm:gap-x-4 gap-y-4 sm:gap-y-6 w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 m-3 sm:m-4 md:m-5 justify-items-center items-center">
      {habits.map((habit) => (
        <Habit key={habit.id} habit={habit} onEdit={onEdit} />
      ))}
    </div>
  );
}