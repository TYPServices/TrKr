export const fmt = (n: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Math.abs(n) < 100 ? 2 : 0,
    maximumFractionDigits: Math.abs(n) < 100 ? 2 : 0,
  }).format(n);

export const fK = (n: number): string =>
  n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M`
  : n >= 1e3 ? `$${(n / 1e3).toFixed(0)}K`
  : fmt(n);
