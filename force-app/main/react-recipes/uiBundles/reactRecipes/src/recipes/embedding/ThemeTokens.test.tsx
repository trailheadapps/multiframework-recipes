import { render, screen, act } from '@testing-library/react';
import { axe } from 'vitest-axe';
import ThemeTokens from './ThemeTokens';
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

describe('ThemeTokens', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('defaults to the light theme when the host has not sent one', async () => {
    mockView(stubUiState({}));

    const { container } = render(<ThemeTokens />);
    await flushSdk();

    expect(container.querySelector('.light')).not.toBeNull();
    expect(screen.getByText('Waiting for host…')).toBeInTheDocument();
  });

  it('flips the theme class when the host pushes a new theme', async () => {
    const view = stubUiState({
      theme: 'light',
      recordId: '001',
      name: 'Acme',
    });
    mockView(view);

    const { container } = render(<ThemeTokens />);
    await flushSdk();
    expect(container.querySelector('.light')).not.toBeNull();

    act(() => {
      view.emit({ theme: 'salesforce', recordId: '001', name: 'Acme' });
    });
    expect(container.querySelector('.salesforce')).not.toBeNull();
    expect(
      screen.getByText(/Guest is in salesforce mode/i)
    ).toBeInTheDocument();

    act(() => {
      view.emit({ theme: 'dark', recordId: '001', name: 'Acme' });
    });
    expect(container.querySelector('.dark')).not.toBeNull();
  });

  it('is accessible', async () => {
    mockView(
      stubUiState({
        theme: 'light',
        recordId: '001',
        name: 'Acme',
        industry: 'Tech',
        type: 'Prospect',
        website: 'acme.example',
      })
    );

    const { container } = render(<ThemeTokens />);
    await flushSdk();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
