import * as Sentry from '@sentry/react-native';

export { Sentry };

export function initSentry(): void {
  if (__DEV__) return; // Skip entirely in development — Expo Go can't load native Sentry modules
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    tracesSampleRate: 0.2,
    environment: 'production',
  });
}
