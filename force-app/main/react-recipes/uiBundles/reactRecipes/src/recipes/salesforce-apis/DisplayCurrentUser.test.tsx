/**
 * Mocks DataSDK.fetch for the /chatter/users/me endpoint.
 */
import { render, screen } from '@testing-library/react';
import { type Mock } from 'vitest';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import DisplayCurrentUser from './DisplayCurrentUser';

vi.mock('@salesforce/sdk-data', () => ({
  createDataSDK: vi.fn(),
}));

describe('DisplayCurrentUser', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ fetch: mockFetch });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the user name and email', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ displayName: 'John Doe', email: 'john@example.com' }),
    });

    render(<DisplayCurrentUser />);
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('shows error when fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });

    render(<DisplayCurrentUser />);
    expect(
      await screen.findByText('Failed to fetch current user (401)')
    ).toBeInTheDocument();
  });

  it('is accessible', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ displayName: 'John Doe', email: 'john@example.com' }),
    });
    const { container } = render(<DisplayCurrentUser />);
    await screen.findByText('John Doe');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
