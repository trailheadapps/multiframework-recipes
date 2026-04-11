/**
 * Mocks the two sequential DataSDK.fetch calls (list-ui → list-records)
 * and verifies rendering plus each failure mode in the chain.
 */
import { render, screen } from '@testing-library/react';
import { type Mock } from 'vitest';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import UiApiRest from './UiApiRest';

vi.mock('@salesforce/sdk-data', () => ({
  createDataSDK: vi.fn(),
}));

vi.mock('@salesforce/design-system-react', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Radix Avatar defers <img> rendering until onLoad fires (no-op in jsdom)
vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, ...props }: Record<string, unknown> & { children?: React.ReactNode }) => <span {...props}>{children}</span>,
  AvatarImage: (props: Record<string, unknown>) => <img {...props} />,
  AvatarFallback: (props: Record<string, unknown>) => <span {...props} />,
}));

const listUiResponse = (lists: { id: string; apiName: string; label: string }[]) => ({
  ok: true,
  json: () => Promise.resolve({ lists }),
});

const listRecordsResponse = (records: { fields: Record<string, { value: string | null }> }[]) => ({
  ok: true,
  json: () => Promise.resolve({ records }),
});

describe('UiApiRest', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ fetch: mockFetch });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders a list of contacts after both API calls succeed', async () => {
    mockFetch
      .mockResolvedValueOnce(
        listUiResponse([{ id: 'lv001', apiName: 'AllContacts', label: 'All Contacts' }])
      )
      .mockResolvedValueOnce(
        listRecordsResponse([
          {
            fields: {
              Name: { value: 'Amy Taylor' },
              Title: { value: 'VP Sales' },
              Phone: { value: '555-1234' },
              Picture__c: { value: 'https://example.com/pic.jpg' },
            },
          },
          {
            fields: {
              Name: { value: 'John Doe' },
              Title: { value: 'Engineer' },
              Phone: { value: '555-0000' },
              Picture__c: { value: null },
            },
          },
        ])
      );

    render(<UiApiRest />);
    expect(await screen.findByText('Amy Taylor')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('VP Sales')).toBeInTheDocument();
    expect(screen.getByText('Engineer')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://example.com/pic.jpg'
    );
  });

  it('shows empty state when list view returns no records', async () => {
    mockFetch
      .mockResolvedValueOnce(
        listUiResponse([{ id: 'lv001', apiName: 'AllContacts', label: 'All Contacts' }])
      )
      .mockResolvedValueOnce(listRecordsResponse([]));

    render(<UiApiRest />);
    expect(await screen.findByText('No contacts found.')).toBeInTheDocument();
  });

  it('shows error when list-ui fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });

    render(<UiApiRest />);
    expect(
      await screen.findByText('List UI fetch failed (400)')
    ).toBeInTheDocument();
  });

  it('shows error when AllContacts list view not found', async () => {
    mockFetch.mockResolvedValueOnce(
      listUiResponse([{ id: 'lv999', apiName: 'RecentlyViewed', label: 'Recently Viewed' }])
    );

    render(<UiApiRest />);
    expect(
      await screen.findByText('AllContacts list view not found')
    ).toBeInTheDocument();
  });

  it('shows error when list-records fetch fails', async () => {
    mockFetch
      .mockResolvedValueOnce(
        listUiResponse([{ id: 'lv001', apiName: 'AllContacts', label: 'All Contacts' }])
      )
      .mockResolvedValueOnce({ ok: false, status: 404 });

    render(<UiApiRest />);
    expect(
      await screen.findByText('List records fetch failed (404)')
    ).toBeInTheDocument();
  });

  it('is accessible', async () => {
    mockFetch
      .mockResolvedValueOnce(
        listUiResponse([{ id: 'lv001', apiName: 'AllContacts', label: 'All Contacts' }])
      )
      .mockResolvedValueOnce(
        listRecordsResponse([
          {
            fields: {
              Name: { value: 'Amy Taylor' },
              Title: { value: 'VP Sales' },
              Phone: { value: '555-1234' },
              Picture__c: { value: null },
            },
          },
        ])
      );
    const { container } = render(<UiApiRest />);
    await screen.findByText('Amy Taylor');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
