import { createContext, useContext } from 'react';

export const HabitContext = createContext(null);

export function useHabits() {
  const context = useContext(HabitContext);

  if (!context) {
    throw new Error('useHabits muss innerhalb von HabitProvider verwendet werden');
  }

  return context;
}