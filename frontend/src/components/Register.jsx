import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from './Input';
import { registerUser } from '../api/auth';
import { getErrorMessage } from '../utils/errors';

export default function Register({ toggleRegister }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const { email, password } = Object.fromEntries(new FormData(event.currentTarget));

    setMessage('');
    setSubmitting(true);

    try {
      await registerUser(email, password);
      navigate('/habits');
    } catch (error) {
          console.error(error);
      setMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-12 mx-auto w-3/4 max-w-100">
      {message && (
        <p className="border border-red-600 rounded text-red-600 font-bold p-2 mb-3 text-center">
          {message}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <Input type="email" label="E-Mail" id="email" required />
        <Input type="password" label="Passwort (mind. 8 Zeichen)" id="password" minLength={8} required />

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg disabled:opacity-60"
        >
          {submitting ? 'Bitte warten ...' : 'Registrieren'}
        </button>
      </form>
      <div className="m-3 flex justify-center items-center">
        <p className="mr-3">Schon registriert?</p>
        <button onClick={toggleRegister} type="button" className="p-1 border rounded-md">
          Anmelden
        </button>
      </div>
    </div>
  );
}