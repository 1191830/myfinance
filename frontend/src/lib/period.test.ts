import { describe, expect, it } from 'vitest';
import { latestTransactionMonth, monthBounds, oneMonthBefore } from './period';

describe('latestTransactionMonth', () => {
  it('falls back to the current month when there are no transactions', () => {
    const expected = new Date().toISOString().slice(0, 7);
    expect(latestTransactionMonth(undefined)).toBe(expected);
    expect(latestTransactionMonth([])).toBe(expected);
  });

  it('picks the month of the most recent transaction, regardless of list order', () => {
    const transactions = [
      { date: '2026-01-15' },
      { date: '2026-03-02' },
      { date: '2026-02-28' },
    ];
    expect(latestTransactionMonth(transactions)).toBe('2026-03');
  });
});

describe('monthBounds', () => {
  it('computes first/last day and the previous month within the same year', () => {
    expect(monthBounds('2026-03')).toEqual({
      first: '2026-03-01',
      last: '2026-03-31',
      prevFirst: '2026-02-01',
      prevYm: '2026-02',
    });
  });

  it('clamps the last day for shorter months', () => {
    expect(monthBounds('2026-02').last).toBe('2026-02-28');
  });

  it('rolls the previous month back across a year boundary', () => {
    expect(monthBounds('2026-01')).toEqual({
      first: '2026-01-01',
      last: '2026-01-31',
      prevFirst: '2025-12-01',
      prevYm: '2025-12',
    });
  });
});

describe('oneMonthBefore', () => {
  it('steps back one month within the same year', () => {
    expect(oneMonthBefore('2026-03')).toBe('2026-02');
  });

  it('rolls back across a year boundary', () => {
    expect(oneMonthBefore('2026-01')).toBe('2025-12');
  });
});
