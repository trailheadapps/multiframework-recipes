/**
 * React Error Boundary
 *
 * An Error Boundary catches JavaScript errors thrown during rendering and
 * displays a fallback UI. Click "Break It" to trigger a render-time throw,
 * then "Try Again" to reset the boundary and remount the child.
 *
 * Key Concepts:
 * - React error boundaries must be class components (no hook equivalent)
 * - getDerivedStateFromError captures the error during rendering
 * - componentDidCatch is called after the error for logging/side effects
 * - Fallback UI replaces the broken subtree until the boundary is reset
 *
 * LWC equivalent: the errorCallback() lifecycle hook fires when a descendant
 * throws during rendering, giving you access to the error and stack trace.
 *
 * @see DisplayCurrentUser — fetching current user via REST API
 */
import { Component, useState, ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

export default function ErrorBoundaryRecipe() {
  // Incrementing key forces ErrorBoundary + BuggyChild to fully remount on reset
  const [key, setKey] = useState(0);
  const [broken, setBroken] = useState(false);

  function reset() {
    setBroken(false);
    setKey(k => k + 1);
  }

  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="outline"
        className="border-rose-300 text-rose-600 hover:bg-rose-50"
        onClick={() => setBroken(true)}
        disabled={broken}
      >
        Break It
      </Button>

      {/* key prop remounts the boundary on reset so its hasError state clears */}
      <ErrorBoundary key={key} onReset={reset}>
        <BuggyChild shouldThrow={broken} />
      </ErrorBoundary>
    </div>
  );
}

function BuggyChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    // Throwing during render — this is what ErrorBoundary catches
    throw new Error('Render error: BuggyChild intentionally threw');
  }
  return (
    <div className="rounded-md bg-muted p-4 text-sm">
      Component rendered successfully. Click "Break It" to trigger a render
      error.
    </div>
  );
}

// Must be a class component — functional Error Boundaries are not supported.
type BoundaryState = { hasError: false } | { hasError: true; message: string };

class ErrorBoundary extends Component<
  { children: ReactNode; onReset: () => void },
  BoundaryState
> {
  constructor(props: ErrorBoundary['props']) {
    super(props);
    this.state = { hasError: false };
  }

  // Called during rendering when a descendant throws. Return new state.
  static getDerivedStateFromError(error: Error): BoundaryState {
    return { hasError: true, message: error.message };
  }

  // Called after the error is captured. Use to log to an error service.
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="rounded-md bg-rose-50 border border-rose-200 p-4 text-rose-700"
          role="alert"
        >
          <h2 className="text-base font-semibold mb-1">
            Caught by ErrorBoundary
          </h2>
          <p className="text-sm mb-3">
            {(this.state as { hasError: true; message: string }).message}
          </p>
          <Button variant="ghost" onClick={this.props.onReset}>
            Try Again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
