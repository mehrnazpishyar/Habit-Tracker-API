export default function HabitButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="p-2 m-4 border rounded-md text-lg">
      + Habit erstellen
    </button>
  );
}