import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useHoldings } from '../hooks/useHoldings';
import { useHomeData } from '../hooks/useHomeData';
import { useBudget } from '../hooks/useBudget';
import { useDividends } from '../hooks/useDividends';
import { useProfile } from '../hooks/useProfile';
import { DEMO_HOLDINGS, DEMO_HOME, DEMO_BUDGET, DEMO_DIVIDENDS, DEMO_PROFILE } from '../lib/demo';

// Mock Supabase — returns unauthenticated by default
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useHoldings — unauthenticated', () => {
  it('returns DEMO_HOLDINGS as placeholder data immediately', () => {
    const { result } = renderHook(() => useHoldings(), { wrapper });
    expect(result.current.data).toEqual(DEMO_HOLDINGS);
  });

  it('has 8 demo holdings', () => {
    const { result } = renderHook(() => useHoldings(), { wrapper });
    expect(result.current.data).toHaveLength(8);
  });

  it('demo holdings contain expected symbols', () => {
    const { result } = renderHook(() => useHoldings(), { wrapper });
    const symbols = result.current.data?.map(h => h.symbol) ?? [];
    expect(symbols).toContain('AAPL');
    expect(symbols).toContain('VOO');
  });
});

describe('useHomeData — unauthenticated', () => {
  it('returns DEMO_HOME as placeholder data', () => {
    const { result } = renderHook(() => useHomeData(), { wrapper });
    expect(result.current.data).toEqual(DEMO_HOME);
  });

  it('demo home data has positive net worth', () => {
    const { result } = renderHook(() => useHomeData(), { wrapper });
    expect((result.current.data?.netWorth ?? 0)).toBeGreaterThan(0);
  });
});

describe('useBudget — unauthenticated', () => {
  it('returns DEMO_BUDGET as placeholder data', () => {
    const { result } = renderHook(() => useBudget(), { wrapper });
    expect(result.current.data).toEqual(DEMO_BUDGET);
  });

  it('has 8 budget categories', () => {
    const { result } = renderHook(() => useBudget(), { wrapper });
    expect(result.current.data).toHaveLength(8);
  });

  it('all categories have non-negative spent amounts', () => {
    const { result } = renderHook(() => useBudget(), { wrapper });
    result.current.data?.forEach(c => {
      expect(c.spent_amount).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('useDividends — unauthenticated', () => {
  it('returns DEMO_DIVIDENDS as placeholder data', () => {
    const { result } = renderHook(() => useDividends(), { wrapper });
    expect(result.current.data).toEqual(DEMO_DIVIDENDS);
  });

  it('demo dividends sum to expected annual income', () => {
    const { result } = renderHook(() => useDividends(), { wrapper });
    const total = result.current.data?.reduce((s, d) => s + d.annual_income, 0) ?? 0;
    expect(total).toBeGreaterThan(0);
  });
});

describe('useProfile — unauthenticated', () => {
  it('returns DEMO_PROFILE as placeholder data', () => {
    const { result } = renderHook(() => useProfile(), { wrapper });
    expect(result.current.data).toEqual(DEMO_PROFILE);
  });

  it('demo profile has 4 linked accounts', () => {
    const { result } = renderHook(() => useProfile(), { wrapper });
    expect(result.current.data?.linked_accounts).toHaveLength(4);
  });

  it('demo profile is pro', () => {
    const { result } = renderHook(() => useProfile(), { wrapper });
    expect(result.current.data?.is_pro).toBe(true);
  });
});
