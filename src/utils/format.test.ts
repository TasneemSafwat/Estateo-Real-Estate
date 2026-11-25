import { describe, expect, it } from 'vitest';
import { convertCurrency, formatArea, initials, parseNumericInput } from '@/utils/format';

describe('convertCurrency', () => {
  it('returns the same amount when the currency is unchanged', () => {
    expect(convertCurrency(250, 'USD', 'USD')).toBe(250);
    expect(convertCurrency(1_000, 'AED', 'AED')).toBe(1_000);
  });

  it('converts through the USD base rate', () => {
    expect(convertCurrency(1, 'USD', 'AED')).toBeCloseTo(3.67, 2);
    expect(convertCurrency(3.67, 'AED', 'USD')).toBeCloseTo(1, 2);
    expect(convertCurrency(100, 'USD', 'EUR')).toBeCloseTo(92, 2);
  });
});

describe('initials', () => {
  it('uses the first letter of the first two words', () => {
    expect(initials('Omar Khalil')).toBe('OK');
    expect(initials('amira saleh')).toBe('AS');
  });

  it('handles single names and extra whitespace', () => {
    expect(initials('  Cher  ')).toBe('C');
    expect(initials('Ada Lovelace Byron')).toBe('AL');
  });
});

describe('parseNumericInput', () => {
  it('strips currency symbols and thousands separators', () => {
    expect(parseNumericInput('$1,200')).toBe(1200);
    expect(parseNumericInput('3 000')).toBe(3000);
  });

  it('returns null for blank or incomplete input', () => {
    expect(parseNumericInput('')).toBeNull();
    expect(parseNumericInput('-')).toBeNull();
    expect(parseNumericInput('abc')).toBeNull();
  });
});

describe('formatArea', () => {
  it('appends the area unit', () => {
    expect(formatArea(1500)).toBe('1,500 sq ft');
  });
});
