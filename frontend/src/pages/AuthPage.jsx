import { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  function toggleRegister() {
    setIsLogin((prev) => !prev);
  }

  return (
    <div className="mx-auto w-3/4 flex flex-col text-center py-12 px-8">
      <div>
        <h1 className="text-5xl font-bold mb-6">Habit Tracker</h1>
        <p className="text-xl font-semibold border-3 p-3 inline-block rounded-md">
          Jeden Tag 1 % besser
        </p>
      </div>

      {isLogin ? (
        <Login toggleRegister={toggleRegister} />
      ) : (
        <Register toggleRegister={toggleRegister} />
      )}
    </div>
  );
}