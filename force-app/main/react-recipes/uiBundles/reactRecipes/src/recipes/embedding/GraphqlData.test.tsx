import { render, screen, act } from '@testing-library/react';
import { axe } from 'vitest-axe';
import GraphqlData from './GraphqlData';
import { getViewSDK } from '@salesforce/platform-sdk';

vi.mock('@salesforce/platform-sdk', () => ({ getViewSDK: vi.fn() }));

type EventCb = (evt: Event) => void;

interface HostData {
  accountName?: string | null;
  contacts?: unknown[];
  error?: string;
  loaded?: boolean;
}

// Stub view SDK as an event bus. The guest attaches a `contactsdata` listener
// then dispatches `requestcontacts`; the host replies with its current data.
// `push` models the host proactively sending fresh data.
function stubView(seed: HostData) {
  const listeners: Record<string, EventCb[]> = {};
  let data = seed;
  const fire = (name: string, detail: unknown) => {
    (listeners[name] ?? []).forEach(cb =>
      cb(new CustomEvent(name, { detail }))
    );
  };
  return {
    addEventListener: (name: string, cb: EventCb) => {
      (listeners[name] ??= []).push(cb);
    },
    removeEventListener: (name: string, cb: EventCb) => {
      const list = listeners[name] ?? [];
      const i = list.indexOf(cb);
      if (i >= 0) list.splice(i, 1);
    },
    dispatchEvent: (evt: Event) => {
      // Guest → host handshake: reply to a request with the current data.
      if (evt.type === 'requestcontacts') {
        fire('contactsdata', data);
      }
      return true;
    },
    // Test helper: host pushes fresh data down to the guest.
    push: (next: HostData) => {
      data = next;
      fire('contactsdata', next);
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

const CONTACTS = [
  {
    id: '003a',
    name: 'Amy Taylor',
    title: 'VP of Engineering',
    email: 'amy@demo.net',
    phone: '415-555-0101',
  },
  { id: '003b', name: 'Parker Brown', title: 'Buyer', email: null, phone: null },
];

describe('GraphqlData', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('waits for host data when none has arrived', async () => {
    mockView(stubView({}));

    render(<GraphqlData />);
    await flushSdk();

    expect(
      screen.getByText(/Waiting for the host to send Contact data/i)
    ).toBeInTheDocument();
  });

  it("renders the account's related contacts the host replies with on request", async () => {
    mockView(
      stubView({ accountName: 'Acme Corp', contacts: CONTACTS, loaded: true })
    );

    render(<GraphqlData />);
    await flushSdk();

    expect(screen.getByText('Acme Corp contacts')).toBeInTheDocument();
    expect(
      screen.getByText(
        '2 contacts related to Acme Corp, fetched by the host and sent as an event.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Amy Taylor')).toBeInTheDocument();
    expect(screen.getByText('Parker Brown')).toBeInTheDocument();
    expect(screen.getByText('VP of Engineering')).toBeInTheDocument();
  });

  it('re-renders when the host pushes new data', async () => {
    const view = stubView({ accountName: 'Acme Corp', contacts: [] });
    mockView(view);

    render(<GraphqlData />);
    await flushSdk();
    expect(screen.getByText(/Waiting for the host/i)).toBeInTheDocument();

    act(() => {
      view.push({ accountName: 'Acme Corp', contacts: CONTACTS, loaded: true });
    });
    expect(screen.getByText('Amy Taylor')).toBeInTheDocument();
  });

  it('shows an empty state for a loaded account with no contacts', async () => {
    mockView(
      stubView({ accountName: 'Metro Services Inc', contacts: [], loaded: true })
    );

    render(<GraphqlData />);
    await flushSdk();

    // Loaded-but-empty must read differently from "still waiting".
    expect(
      screen.getByText('No contacts related to Metro Services Inc.')
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Waiting for the host/i)
    ).not.toBeInTheDocument();
  });

  it('surfaces a host-forwarded GraphQL error', async () => {
    mockView(stubView({ error: 'insufficient access', contacts: [] }));

    render(<GraphqlData />);
    await flushSdk();

    expect(screen.getByText('insufficient access')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    mockView(
      stubView({ accountName: 'Acme Corp', contacts: CONTACTS, loaded: true })
    );

    const { container } = render(<GraphqlData />);
    await flushSdk();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
