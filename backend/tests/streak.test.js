import { describe, it, expect } from '@jest/globals';
import { calculateStreak, calculateLongestStreak } from '../src/utils/streak.js';

describe('calculateStreak', () => {
  const today = '2026-10-05';

  it('liefert 0 ohne Check-ins', () => {
    expect(calculateStreak([], today)).toBe(0);
  });

  it('zählt aufeinanderfolgende Tage bis heute', () => {
    expect(calculateStreak(['2026-10-05', '2026-10-04', '2026-10-03'], today)).toBe(3);
  });

  it('hält die Streak mit einem Check-in von gestern am Leben', () => {
    expect(calculateStreak(['2026-10-04'], today)).toBe(1);
  });

  it('liefert 0, wenn der letzte Check-in älter als gestern ist', () => {
    expect(calculateStreak(['2026-10-03'], today)).toBe(0);
  });

  it('bricht bei einer Lücke ab', () => {
    expect(calculateStreak(['2026-10-05', '2026-10-04', '2026-10-02'], today)).toBe(2);
  });

  it('funktioniert über den Monatswechsel', () => {
    expect(calculateStreak(['2026-11-01', '2026-10-31', '2026-10-30'], '2026-11-01')).toBe(3);
  });
});

describe('calculateLongestStreak', () => {
  it('liefert 0 ohne Check-ins', () => {
    expect(calculateLongestStreak([])).toBe(0);
  });

  it('findet die längste Folge', () => {
    const dates = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-05', '2026-10-06'];
    expect(calculateLongestStreak(dates)).toBe(3);
  });
});