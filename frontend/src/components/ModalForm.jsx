import { useState } from 'react';
import toast from 'react-hot-toast';
import Input from './Input';
import { useHabits } from '../context/habitContext';
import { getErrorMessage } from '../utils/errors';

export default function ModalForm({ onClose, editHabit }) {
  const { createHabit, updateHabit } = useHabits();
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget));
    const data = { name: form.name, description: form.description, color: form.color };

    setMessage('');
    setSubmitting(true);

    try {
      if (editHabit) {
        await updateHabit(editHabit.id, data);
        toast.success('Habit aktualisiert');
      } else {
        await createHabit(data);
        toast.success('Habit erstellt');
      }
      onClose();
    } catch (error) {
      setMessage(getErrorMessage(error));
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {editHabit ? 'Habit bearbeiten' : 'Neues Habit'}
          </h2>
          <button
            type="button"
            aria-label="Schließen"
            onClick={onClose}
            className="text-gray-500 text-2xl"
          >
            ×
          </button>
        </div>

        {message && (
          <p className="border border-red-600 rounded text-red-600 font-bold p-2 mb-3 text-center">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            label="Name"
            id="name"
            required
            maxLength={100}
            defaultValue={editHabit?.name ?? ''}
          />
          <Input
            type="text"
            label="Beschreibung (optional)"
            id="description"
            maxLength={500}
            defaultValue={editHabit?.description ?? ''}
          />
          <div className="flex flex-col mb-4">
            <label className="mb-2 font-semibold text-left" htmlFor="color">
              Farbe
            </label>
            <input
              id="color"
              name="color"
              type="color"
              defaultValue={editHabit?.color ?? '#4F46E5'}
              className="h-12 w-full"
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gray-900 text-white py-3 px-4 rounded-lg font-semibold disabled:opacity-60"
            >
              {editHabit ? 'Speichern' : 'Erstellen'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}