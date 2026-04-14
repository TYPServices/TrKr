import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Suppress expected React error output during boundary tests
const originalConsoleError = console.error;
beforeAll(() => { console.error = jest.fn(); });
afterAll(() => { console.error = originalConsoleError; });

// Mock Sentry so no real network calls are made
jest.mock('../lib/sentry', () => ({
  Sentry: {
    captureException: jest.fn(),
  },
  initSentry: jest.fn(),
}));

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test explosion');
  return null;
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    const { queryByText } = render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(queryByText('Something went wrong')).toBeNull();
  });

  it('renders default fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText('Test explosion')).toBeTruthy();
  });

  it('renders custom fallback prop instead of default UI', () => {
    render(
      <ErrorBoundary fallback={<></>}>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.queryByText('Something went wrong')).toBeNull();
  });

  it('calls Sentry.captureException when a child throws', () => {
    const { Sentry } = require('../lib/sentry');
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ extra: expect.any(Object) })
    );
  });

  it('calls onReset callback when "Try again" is pressed', () => {
    const onReset = jest.fn();
    render(
      <ErrorBoundary onReset={onReset}>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    fireEvent.press(screen.getByText('Try again'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('re-renders after "Try again" is pressed (error re-caught if child still throws)', () => {
    const onReset = jest.fn();
    render(
      <ErrorBoundary onReset={onReset}>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    fireEvent.press(screen.getByText('Try again'));
    // onReset was called; Bomb still throws, so boundary catches it again
    expect(onReset).toHaveBeenCalled();
    expect(screen.getByText('Something went wrong')).toBeTruthy();
  });
});
