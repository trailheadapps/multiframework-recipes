import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import UnsavedChanges from './UnsavedChanges';
import { getViewSDK } from '@salesforce/platform-sdk';

vi.mock('@salesforce/platform-sdk', () => ({ getViewSDK: vi.fn() }));

type SubscribeCb = (next: { props: Record<string, unknown> }) => void;

function stubView(initial: Record<string, unknown>) {
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
    dispatchEvent: vi.fn(),
    markDirtyState: vi.fn(),
    clearDirtyState: vi.fn(),
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

describe('UnsavedChanges', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('seeds the form from ui-state on mount', async () => {
    mockView(
      stubView({
        recordId: '001',
        name: 'Acme',
        rating: 'Warm',
        type: 'Prospect',
      })
    );

    render(<UnsavedChanges />);
    await flushSdk();

    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe(
      'Acme'
    );
  });

  it('calls markDirtyState when the form diverges from saved', async () => {
    const user = userEvent.setup();
    const view = stubView({
      recordId: '001',
      name: 'Acme',
      rating: 'Warm',
      type: 'Prospect',
    });
    mockView(view);

    render(<UnsavedChanges />);
    await flushSdk();
    view.markDirtyState.mockClear();
    view.clearDirtyState.mockClear();

    await user.type(screen.getByLabelText('Name'), 'X');
    await flushSdk();

    expect(view.markDirtyState).toHaveBeenCalled();
  });

  it('dispatches a save event with the form values when Save is clicked', async () => {
    const user = userEvent.setup();
    const view = stubView({
      recordId: '001',
      name: 'Acme',
      rating: 'Warm',
      type: 'Prospect',
    });
    mockView(view);

    render(<UnsavedChanges />);
    await flushSdk();

    const nameInput = screen.getByLabelText('Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Umbrella Corp');

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await flushSdk();

    expect(view.dispatchEvent).toHaveBeenCalledTimes(1);
    const evt = view.dispatchEvent.mock.calls[0][0] as CustomEvent;
    expect(evt.type).toBe('guestsave');
    expect(evt.detail).toEqual({
      name: 'Umbrella Corp',
      rating: 'Warm',
      type: 'Prospect',
    });
  });

  it('Discard reverts the form to the saved snapshot', async () => {
    const user = userEvent.setup();
    const view = stubView({
      recordId: '001',
      name: 'Acme',
      rating: 'Warm',
      type: 'Prospect',
    });
    mockView(view);

    render(<UnsavedChanges />);
    await flushSdk();

    const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
    await user.clear(nameInput);
    await user.type(nameInput, 'Draft Name');
    expect(nameInput.value).toBe('Draft Name');

    await user.click(screen.getByRole('button', { name: 'Discard' }));
    expect(nameInput.value).toBe('Acme');
  });

  it('re-seeds when host props arrive late', async () => {
    const view = stubView({});
    mockView(view);

    render(<UnsavedChanges />);
    await flushSdk();
    expect(
      screen.getByText(/Drop this component on an Account record page/i)
    ).toBeInTheDocument();

    act(() => {
      view.emit({
        recordId: '001',
        name: 'Late Arrival',
        rating: 'Cold',
        type: 'Prospect',
      });
    });

    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe(
      'Late Arrival'
    );
  });

  it('is accessible', async () => {
    mockView(
      stubView({
        recordId: '001',
        name: 'Acme',
        rating: 'Warm',
        type: 'Prospect',
      })
    );

    const { container } = render(<UnsavedChanges />);
    await flushSdk();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
