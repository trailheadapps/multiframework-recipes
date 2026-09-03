import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import SendToHost from './SendToHost';
import { getViewSDK } from '@salesforce/platform-sdk';

vi.mock('@salesforce/platform-sdk', () => ({ getViewSDK: vi.fn() }));

function stubView(props: Record<string, unknown>) {
  return {
    getUiState: () => ({
      state: { props },
      subscribe: () => () => undefined,
    }),
    dispatchEvent: vi.fn(),
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

describe('SendToHost', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('disables the grid when disconnected', async () => {
    mockView(stubView({}));

    render(<SendToHost />);
    await flushSdk();

    // Every scoring button should be disabled until a recordId arrives.
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => expect(btn).toBeDisabled());
  });

  it('dispatches a score CustomEvent with the cell payload', async () => {
    const user = userEvent.setup();
    const view = stubView({
      recordId: '001',
      rating: 'Warm',
      type: 'Prospect',
    });
    mockView(view);

    render(<SendToHost />);
    await flushSdk();

    await user.click(
      screen.getByRole('button', { name: /Score high engagement, strong fit/i })
    );
    await flushSdk();

    expect(view.dispatchEvent).toHaveBeenCalledTimes(1);
    const dispatched = view.dispatchEvent.mock.calls[0][0] as CustomEvent;
    expect(dispatched.type).toBe('score');
    expect(dispatched.detail).toEqual({
      rating: 'Hot',
      type: 'Customer - Direct',
    });
  });

  it('is accessible', async () => {
    mockView(stubView({ recordId: '001', rating: 'Warm', type: 'Prospect' }));

    const { container } = render(<SendToHost />);
    await flushSdk();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
