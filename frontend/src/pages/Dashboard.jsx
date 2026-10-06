import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import HabitGrid from '../components/HabitGrid';
import HabitButton from '../components/HabitButton';
import ModalForm from '../components/ModalForm';
import { logoutUser } from '../api/auth';
import { USERNAME_KEY } from '../api/axiosInstance';
import { useHabits } from '../context/habitContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { habits, loading, error, fetchHabits, clearHabits } = useHabits();
  const [showModal, setShowModal] = useState(false);
  const [editHabit, setEditHabit] = useState(null);
  const username = localStorage.getItem(USERNAME_KEY) || 'Unbekannt';

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  function openCreate() {
    setEditHabit(null);
    setShowModal(true);
  }

  function openEdit(habit) {
    setEditHabit(habit);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditHabit(null);
  }

  function signOut() {
    clearHabits();
    logoutUser();
    navigate('/');
  }

  return (
    <>
      {showModal &&
        createPortal(
          <ModalForm onClose={closeModal} editHabit={editHabit} />,
          document.getElementById('modal'),
        )}

      <header className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 py-6 sm:py-8 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 border-b-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-black text-center sm:text-left">
          Habits von {username}
        </h1>
        <button
          onClick={signOut}
          className="bg-gray-900 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base sm:w-auto"
        >
          Abmelden
        </button>
      </header>

      {loading ? (
        <h1 className="text-center mt-20">Wird geladen ...</h1>
      ) : error ? (
        <div className="flex flex-col items-center mt-20 px-4 text-center">
          <p className="text-red-600 font-bold">{error}</p>
          <button onClick={fetchHabits} className="p-2 m-4 border rounded-md">
            Erneut versuchen
          </button>
        </div>
      ) : habits.length > 0 ? (
        <div className="flex flex-col justify-center items-center mt-10">
          <HabitButton onClick={openCreate} />
          <HabitGrid onEdit={openEdit} />
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center mt-20">
          <h1 className="text-2xl sm:text-3xl text-center m-3 px-4">Noch keine Habits</h1>
          <p className="text-center px-4">Erstelle dein erstes Habit, um loszulegen</p>
          <HabitButton onClick={openCreate} />
        </div>
      )}
    </>
  );
}