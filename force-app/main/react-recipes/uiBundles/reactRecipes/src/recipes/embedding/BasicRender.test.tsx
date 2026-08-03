/**
 * The guest reads Account props from `viewSDK.getUiState()` — a synchronous
 * call that returns { state, subscribe }. We mock @salesforce/platform-sdk's
 * getViewSDK() to hand back a stubbed view SDK instead of booting the real
 * platform bridge.
 */
import { render, screen, act } from '@testing-library/react';
import { axe } from 'vitest-axe';
import BasicRender from './BasicRender';
import { getViewSDK } from '@salesforce/platform-sdk';

vi.mock('@salesforce/platform-sdk', () => ({ getViewSDK: vi.fn() }));

type SubscribeCb = (next: { props: Record<string, unknown> }) => void;

function stubUiState(initial: Record<string, unknown>) {
  const listeners: SubscribeCb[] = [];
  const state = { props: initial };
  return {
    getUiState: () => ({
      state,
      subscribe: (cb: SubscribeCb) => {
        listeners.push(cb);
        return () => {
          const i = listeners.indexOf(cb);
          if (i >= 0) listeners.splice(i, 1);
        };
      },
    }),
    emit: (next: Record<string, unknown>) => {
      state.props = next;
      listeners.forEach(cb => cb({ props: next }));
    },
  };
}

function mockView(view: unknown) {
  (getViewSDK as ReturnType<typeof vi.fn>).mockResolvedValue(view);
}

// The recipe's effect awaits getViewSDK() before reading state, which
// queues a microtask. Flushing it inside act() lets the resulting
// render commit before assertions.
async function flushSdk() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe('BasicRender', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the account fields from ui-state', async () => {
    mockView(
      stubUiState({
        recordId: '001',
        name: 'Acme Corp',
        industry: 'Technology',
        type: 'Customer - Direct',
        website: 'acme.example',
      })
    );

    render(<BasicRender />);
    await flushSdk();

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Customer - Direct')).toBeInTheDocument();
    expect(screen.getByText('acme.example')).toBeInTheDocument();
  });

  it('shows the waiting state when no props have arrived', async () => {
    mockView(stubUiState({}));

    render(<BasicRender />);
    await flushSdk();

    expect(screen.getByText('Waiting for host…')).toBeInTheDocument();
  });

  it('updates when the host pushes new props via subscribe', async () => {
    const view = stubUiState({ name: 'Old' });
    mockView(view);

    render(<BasicRender />);
    await flushSdk();
    expect(screen.getByText('Old')).toBeInTheDocument();

    act(() => {
      view.emit({ name: 'New', industry: 'Retail' });
    });

    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Retail')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    mockView(
      stubUiState({
        recordId: '001',
        name: 'Acme',
        industry: 'Tech',
        type: 'Prospect',
        website: 'acme.example',
      })
    );

    const { container } = render(<BasicRender />);
    await flushSdk();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
