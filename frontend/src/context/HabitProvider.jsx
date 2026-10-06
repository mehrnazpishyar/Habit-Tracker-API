import { useCallback, useState } from 'react';
import { HabitContext } from './habitContext';
import * as habitsApi from '../api/habits';
import { getErrorMessage } from '../utils/errors';

export default function HabitProvider({ children }) {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchHabits = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      setHabits(await habitsApi.fetchHabits());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  async function createHabit(data) {
    const habit = await habitsApi.createHabit(data);
    setHabits((prev) => [habit, ...prev]);
    return habit;
  }

  async function updateHabit(id, data) {
    const updated = await habitsApi.updateHabit(id, data);
    setHabits((prev) => prev.map((habit) => (habit.id === id ? updated : habit)));
    return updated;
  }

  async function removeHabit(id) {
    await habitsApi.deleteHabit(id);
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
  }

  function clearHabits() {
    setHabits([]);
  }

  const value = {
    habits,
    loading,
    error,
    fetchHabits,
    createHabit,
    updateHabit,
    removeHabit,
    clearHabits,
  };

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}