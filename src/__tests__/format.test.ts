/** @jest-environment node */
import { fmt, fK } from '../utils/format';

describe('fmt()', () => {
  it('formats large values with no decimal places', () => {
    expect(fmt(487210)).toBe('$487,210');
    expect(fmt(142847)).toBe('$142,847');
    expect(fmt(1855)).toBe('$1,855');
  });

  it('formats small values (< 100) with 2 decimal places', () => {
    expect(fmt(99.99)).toBe('$99.99');
    expect(fmt(1.5)).toBe('$1.50');
    expect(fmt(0.01)).toBe('$0.01');
  });

  it('formats the boundary value of exactly 100 without decimals', () => {
    expect(fmt(100)).toBe('$100');
  });

  it('formats 99.99 with decimals (below boundary)', () => {
    expect(fmt(99.99)).toBe('$99.99');
  });

  it('handles zero', () => {
    // 0 < 100, so 2 decimal places apply
    expect(fmt(0)).toBe('$0.00');
  });

  it('handles negative values', () => {
    expect(fmt(-1500)).toBe('-$1,500');
  });

  it('handles negative small values with decimals', () => {
    expect(fmt(-50.25)).toBe('-$50.25');
  });
});

describe('fK()', () => {
  it('formats millions with one decimal', () => {
    expect(fK(1_212_000)).toBe('$1.2M');
    expect(fK(2_500_000)).toBe('$2.5M');
    expect(fK(10_000_000)).toBe('$10.0M');
  });

  it('formats thousands with no decimal', () => {
    expect(fK(142_847)).toBe('$143K');
    expect(fK(1_000)).toBe('$1K');
    expect(fK(487_210)).toBe('$487K');
  });

  it('formats small values using fmt fallback', () => {
    expect(fK(999)).toBe('$999');
    expect(fK(50.5)).toBe('$50.50');
  });

  it('formats the million boundary', () => {
    expect(fK(1_000_000)).toBe('$1.0M');
  });

  it('formats the thousand boundary', () => {
    expect(fK(1000)).toBe('$1K');
  });
});
