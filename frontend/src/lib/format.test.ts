import { describe, expect, it } from 'vitest';
import {
  formatCurrency,
  formatCurrencyShort,
  formatSignedCurrency,
  formatPercent,
  formatDayMonth,
  formatDate,
  formatMonthYear,
} from './format';

// Intl.NumberFormat('pt-PT', { style: 'currency', ... }) puts a U+00A0 (NBSP) before "€".
const NBSP = ' ';

describe('formatCurrency', () => {
  it('formats with two decimal places, pt-PT separators', () => {
    expect(formatCurrency(1840.2)).toBe(`1840,20${NBSP}€`);
  });
});

describe('formatCurrencyShort', () => {
  it('formats with no decimal places', () => {
    expect(formatCurrencyShort(6500)).toBe(`6500${NBSP}€`);
  });
});

describe('formatSignedCurrency', () => {
  it('prefixes a positive value with +', () => {
    expect(formatSignedCurrency(4250)).toBe(`+4250,00${NBSP}€`);
  });

  it('prefixes a negative value with − and shows the absolute value', () => {
    expect(formatSignedCurrency(-68.4)).toBe(`−68,40${NBSP}€`);
  });

  it('adds no sign for zero', () => {
    expect(formatSignedCurrency(0)).toBe(`0,00${NBSP}€`);
  });
});

describe('formatPercent', () => {
  it('formats with one decimal place by default', () => {
    expect(formatPercent(43.2)).toBe('43,2%');
  });

  it('honours a custom digit count', () => {
    expect(formatPercent(43.256, 2)).toBe('43,26%');
  });
});

describe('formatDayMonth', () => {
  it('formats an ISO date as day/month', () => {
    expect(formatDayMonth('2025-09-08')).toBe('08/09');
  });
});

describe('formatDate', () => {
  it('formats an ISO date as day/month/year', () => {
    expect(formatDate('2025-09-08')).toBe('08/09/2025');
  });
});

describe('formatMonthYear', () => {
  it('formats an ISO date with month + year', () => {
    // Node's bundled ICU renders pt-PT { month: 'short' } as numeric (no abbreviated form),
    // unlike browsers which show "set. 2025" — assert what this test env actually produces.
    expect(formatMonthYear('2025-09-08')).toBe('09/2025');
  });
});
