import { useCallback, useState } from 'react';
import { HabitContext } from './habitContext';
import * as habitsApi from '../api/habits';
import * as checkInsApi from '../api/checkins';
import * as statsApi from '../api/stats';
import { getErrorMessage } from '../utils/errors';
import { getLocalDateString } from '../utils/dates';

export default function HabitProvider({ children }) {
  const [habits, setHabits] = useState([]);
    const [stats, setStats] = useState({});
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

    const fetchStats = useCallback(async () => {
    try {
      const data = await statsApi.fetchStats();
      setStats(Object.fromEntries(data.habits.map((item) => [item.id, item])));
    } catch {
      setStats({});
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

   async function toggleToday(habit) {
    const today = getLocalDateString();
    const doneToday = habit.lastCheckIn === today;

    if (doneToday) {
      const [entry] = await checkInsApi.fetchCheckIns(habit.id, { from: today, to: today });
      if (entry) {
        await checkInsApi.deleteCheckIn(habit.id, entry.id);
      }
    } else {
      await checkInsApi.createCheckIn(habit.id, today);
    }

    const [updated] = await Promise.all([habitsApi.fetchHabit(habit.id), fetchStats()]);
    setHabits((prev) => prev.map((item) => (item.id === habit.id ? updated : item)));

    return !doneToday;
  }


  function clearHabits() {
    setHabits([]);
    setStats({});
  }

  const value = {
    habits,
    loading,
    stats,
    error,
    fetchHabits,
    fetchStats,
    createHabit,
    updateHabit,
    removeHabit,
    toggleToday,
    clearHabits,
  };

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}