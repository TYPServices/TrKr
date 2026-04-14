import * as Sentry from '@sentry/react-native';

export { Sentry };

export function initSentry(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) return; // No DSN configured — skipping (add EXPO_PUBLIC_SENTRY_DSN to .env)

  Sentry.init({
    dsn,
    enabled: !__DEV__,         // Only report in production builds
    tracesSampleRate: 0.2,     // Sample 20% of transactions
    environment: __DEV__ ? 'development' : 'production',
  });
}
