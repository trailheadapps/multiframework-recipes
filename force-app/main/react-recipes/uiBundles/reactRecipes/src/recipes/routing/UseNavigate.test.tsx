// In LWC you mock NavigationMixin by importing the test mock from
// @salesforce/sfdx-lwc-jest and asserting NavigationMixin.navigate was called
// with a PageReference object. Here useNavigate is a plain hook — vi.mock()
// replaces just that export while keeping MemoryRouter and everything else real.
//
// The component uses two setTimeout calls (1200ms save + 900ms nav delay).
// vi.useFakeTimers() + vi.advanceTimersByTimeAsync() advances those without
// waiting in real time — no LWC Jest equivalent exists for timer control.
import { render, screen, fireEvent, act } from '@testing-library/react';
import { type Mock } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router';
import { axe } from 'vitest-axe';
import UseNavigate from './UseNavigate';

vi.mock('react-router', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: vi.fn() };
});

describe('UseNavigate', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    (useNavigate as Mock).mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('disables the submit button and shows "Saving…" while the operation is in flight', () => {
    render(
      <MemoryRouter>
        <UseNavigate />
      </MemoryRouter>
    );

    // fireEvent avoids userEvent's internal timer delays, which conflict with
    // vi.useFakeTimers(). The component's onSubmit fires synchronously up to the
    // first await, so setStatus('saving') runs before any timer needs to advance.
    fireEvent.change(screen.getByLabelText('Account Name'), {
      target: { value: 'Acme Corp' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create & Navigate' }));

    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
  });

  it('shows a success toast after the save completes', async () => {
    render(
      <MemoryRouter>
        <UseNavigate />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Account Name'), {
      target: { value: 'Acme Corp' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create & Navigate' }));

    // Advance past the 1200ms simulated async operation. Wrapping in act()
    // ensures React flushes the resulting setStatus('done') state update before
    // the assertion runs. findByText() would normally handle this but it polls
    // via setInterval, which is also fake-timer-controlled and would never fire.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1200);
    });
    expect(screen.getByText(/navigating to Read Data/i)).toBeInTheDocument();
  });

  it('calls navigate("/read-data") after the post-save delay', async () => {
    render(
      <MemoryRouter>
        <UseNavigate />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Account Name'), {
      target: { value: 'Acme Corp' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create & Navigate' }));

    // Advance past the 1200ms save + 900ms navigation delay.
    // LWC equivalent: NavigationMixin.Navigate() assertion after the Apex call resolves.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2100);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/read-data');
  });

  it('is accessible', async () => {
    vi.useRealTimers();
    const { container } = render(
      <MemoryRouter>
        <UseNavigate />
      </MemoryRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
