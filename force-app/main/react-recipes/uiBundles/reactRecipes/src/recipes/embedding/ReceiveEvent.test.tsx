import { render, screen, act } from '@testing-library/react';
import { axe } from 'vitest-axe';
import ReceiveEvent from './ReceiveEvent';
import { getViewSDK } from '@salesforce/platform-sdk';

vi.mock('@salesforce/platform-sdk', () => ({ getViewSDK: vi.fn() }));

type SubscribeCb = (next: { props: Record<string, unknown> }) => void;
type EventCb = (evt: Event) => void;

// Stub view SDK: ui-state for the ticker + an event bus for `refreshticker`.
function stubView(initial: Record<string, unknown>) {
  const uiListeners: SubscribeCb[] = [];
  const eventListeners: Record<string, EventCb[]> = {};
  const state = { props: initial };
  return {
    getUiState: () => ({
      state,
      subscribe: (cb: SubscribeCb) => {
        uiListeners.push(cb);
        return () => {
          const i = uiListeners.indexOf(cb);
          if (i >= 0) uiListeners.splice(i, 1);
        };
      },
    }),
    addEventListener: (name: string, cb: EventCb) => {
      (eventListeners[name] ??= []).push(cb);
    },
    removeEventListener: (name: string, cb: EventCb) => {
      const list = eventListeners[name] ?? [];
      const i = list.indexOf(cb);
      if (i >= 0) list.splice(i, 1);
    },
    // Test helper: fire a host event.
    fire: (name: string) => {
      (eventListeners[name] ?? []).forEach(cb => cb(new Event(name)));
    },
  };
}

function mockView(view: unknown) {
  (getViewSDK as ReturnType<typeof vi.fn>).mockResolvedValue(view);
}

async function flushSdk() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe('ReceiveEvent', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('prompts to open a record when disconnected', async () => {
    mockView(stubView({}));

    render(<ReceiveEvent />);
    await flushSdk();

    expect(
      screen.getByText(/Drop this component on an Account record page/i)
    ).toBeInTheDocument();
  });

  it('shows the empty state when the Account has no ticker', async () => {
    mockView(stubView({ recordId: '001', name: 'Acme' }));

    render(<ReceiveEvent />);
    await flushSdk();

    expect(
      screen.getByText(/This Account has no ticker symbol/i)
    ).toBeInTheDocument();
  });

  it('shows a quote once a ticker arrives and re-pulls on refreshticker', async () => {
    const view = stubView({
      recordId: '001',
      name: 'Acme',
      tickerSymbol: 'ACME',
    });
    mockView(view);

    render(<ReceiveEvent />);
    await flushSdk();

    // Seeded quote renders with a price.
    expect(screen.getByText(/^\$\d/)).toBeInTheDocument();
    expect(screen.getByText(/0 refreshes received/)).toBeInTheDocument();

    // Host fires the event; the guest re-pulls and bumps the counter.
    await act(async () => {
      view.fire('refreshticker');
      await Promise.resolve();
    });

    expect(screen.getByText(/1 refresh received/)).toBeInTheDocument();
  });

  it('is accessible', async () => {
    mockView(stubView({ recordId: '001', name: 'Acme', tickerSymbol: 'ACME' }));

    const { container } = render(<ReceiveEvent />);
    await flushSdk();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
