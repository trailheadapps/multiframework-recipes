/**
 * LWC has no Error Boundary equivalent — render errors crash silently. React
 * class components can implement getDerivedStateFromError to catch descendant
 * throws and display fallback UI. The tests click "Break It" to trigger a
 * render-time throw, verify the boundary catches it, then click "Try Again"
 * to reset via a key-increment remount. Console.error is suppressed for the
 * expected React error boundary logging noise.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import ErrorBoundaryRecipe from './ErrorBoundaryRecipe';

describe('ErrorBoundaryRecipe', () => {
  const originalError = console.error;
  beforeAll(() => {
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (msg.includes('ErrorBoundary') || msg.includes('Error: Uncaught')) return;
      originalError(...args);
    };
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('catches the render error and shows fallback UI', async () => {
    const user = userEvent.setup();
    render(<ErrorBoundaryRecipe />);

    await user.click(screen.getByRole('button', { name: 'Break It' }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByText('Caught by ErrorBoundary')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Render error: BuggyChild intentionally threw')
    ).toBeInTheDocument();
  });

  it('disables Break It button after clicking', async () => {
    const user = userEvent.setup();
    render(<ErrorBoundaryRecipe />);

    await user.click(screen.getByRole('button', { name: 'Break It' }));

    expect(screen.getByRole('button', { name: 'Break It' })).toBeDisabled();
  });

  it('recovers when Try Again is clicked', async () => {
    const user = userEvent.setup();
    render(<ErrorBoundaryRecipe />);

    await user.click(screen.getByRole('button', { name: 'Break It' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Try Again' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.getByText(/Component rendered successfully/)
    ).toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = render(<ErrorBoundaryRecipe />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
