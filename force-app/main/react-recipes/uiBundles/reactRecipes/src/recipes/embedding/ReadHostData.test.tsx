import { render, screen, act } from '@testing-library/react';
import { axe } from 'vitest-axe';
import ReadHostData from './ReadHostData';
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

async function flushSdk() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe('ReadHostData', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('prompts to open a record when disconnected', async () => {
    mockView(stubUiState({}));

    render(<ReadHostData />);
    await flushSdk();

    expect(
      screen.getByText(/Drop this component on an Account record page/i)
    ).toBeInTheDocument();
  });

  it('increments the update counter on each host push', async () => {
    const view = stubUiState({
      recordId: '001',
      name: 'Acme',
      rating: 'Hot',
    });
    mockView(view);

    render(<ReadHostData />);
    await flushSdk();
    // Initial snapshot renders — 0 subscribe pushes yet.
    expect(screen.getByText(/0 updates received/)).toBeInTheDocument();

    act(() => {
      view.emit({ recordId: '001', name: 'Acme', rating: 'Warm' });
    });
    expect(screen.getByText(/1 update received/)).toBeInTheDocument();
    expect(screen.getByText('Warm')).toBeInTheDocument();

    act(() => {
      view.emit({ recordId: '001', name: 'Acme', rating: 'Cold' });
    });
    expect(screen.getByText(/2 updates received/)).toBeInTheDocument();
  });

  it('is accessible', async () => {
    mockView(
      stubUiState({
        recordId: '001',
        name: 'Acme',
        rating: 'Hot',
        type: 'Prospect',
        industry: 'Tech',
        website: 'acme.example',
        phone: '555-1212',
      })
    );

    const { container } = render(<ReadHostData />);
    await flushSdk();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
