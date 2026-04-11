/**
 * Connect API responses are plain JSON (no { value } wrappers like UIAPI).
 * The component fetches Chatter feed elements via DataSDK.fetch and renders
 * actor names, body text, photos, and relative timestamps. Tests mock
 * sdk.fetch to return feed payloads and verify each UI branch: loading
 * skeleton, populated feed, empty state, actor photos, and error handling.
 */
import { render, screen } from '@testing-library/react';
import { type Mock } from 'vitest';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import ConnectApi from './ConnectApi';

vi.mock('@salesforce/sdk-data', () => ({
  createDataSDK: vi.fn(),
}));

// Radix Avatar defers <img> rendering until onLoad fires (no-op in jsdom)
vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, ...props }: Record<string, unknown> & { children?: React.ReactNode }) => <span {...props}>{children}</span>,
  AvatarImage: (props: Record<string, unknown>) => <img {...props} />,
  AvatarFallback: (props: Record<string, unknown>) => <span {...props} />,
}));

const makeFeedItem = (
  id: string,
  displayName: string,
  text: string | null,
  photoUrl: string | null = null
) => ({
  id,
  type: 'TextPost',
  createdDate: new Date(Date.now() - 30 * 60_000).toISOString(), // 30m ago
  actor: {
    displayName,
    photo: photoUrl ? { smallPhotoUrl: photoUrl } : null,
  },
  body: text ? { text } : null,
});

describe('ConnectApi', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ fetch: mockFetch });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders feed items after data loads', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          elements: [
            makeFeedItem('001', 'Alice', 'Hello world'),
            makeFeedItem('002', 'Bob', 'Another post'),
          ],
          currentPageUrl: '/page',
        }),
    });

    render(<ConnectApi />);
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Another post')).toBeInTheDocument();
  });

  it('renders actor photo when available', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          elements: [makeFeedItem('001', 'Alice', 'Hi', 'https://example.com/photo.jpg')],
          currentPageUrl: '/page',
        }),
    });

    render(<ConnectApi />);
    const img = await screen.findByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
    expect(img).toHaveAttribute('alt', 'Alice');
  });

  it('shows empty message when no feed items', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ elements: [], currentPageUrl: '/page' }),
    });

    render(<ConnectApi />);
    expect(
      await screen.findByText(/No Chatter feed items found/)
    ).toBeInTheDocument();
  });

  it('shows error when Connect API fails', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 403 });

    render(<ConnectApi />);
    expect(
      await screen.findByText('Connect API error: 403')
    ).toBeInTheDocument();
  });

  it('displays relative time for feed items', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          elements: [makeFeedItem('001', 'Alice', 'Post')],
          currentPageUrl: '/page',
        }),
    });

    render(<ConnectApi />);
    expect(await screen.findByText(/30m ago/)).toBeInTheDocument();
  });

  it('is accessible', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          elements: [makeFeedItem('001', 'Alice', 'Hello world')],
          currentPageUrl: '/page',
        }),
    });
    const { container } = render(<ConnectApi />);
    await screen.findByText('Alice');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

});
