import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../api/auth';
import { USERNAME_KEY } from '../api/axiosInstance';

export default function Dashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem(USERNAME_KEY) || 'Unbekannt';

  function signOut() {
    logoutUser();
    navigate('/');
  }

  return (
    <>
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

      <p className="text-center mt-20">Hier erscheinen bald deine Habits.</p>
    </>
  );
}