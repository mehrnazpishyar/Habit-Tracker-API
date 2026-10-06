import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [status, setStatus] = useState('wird geprüft ...');

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus('nicht erreichbar'));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-2">
      <h1 className="text-3xl font-bold text-indigo-600">Habit-Tracker</h1>
      <p className="text-slate-600">API-Status: {status}</p>
    </div>
  );
}