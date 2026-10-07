import { getLocalDateString } from './dates';

export const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export function getMonthDays(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells = Array(offset).fill(null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(getLocalDateString(new Date(year, month, day)));
  }

  return cells;
}

export function getMonthRange(year, month) {
  return {
    from: getLocalDateString(new Date(year, month, 1)),
    to: getLocalDateString(new Date(year, month + 1, 0)),
  };
}

export function formatMonth(year, month) {
  return new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(
    new Date(year, month, 1),
  );
}