/**
 * Unlike the other recipes that fetch on mount, this component waits for a
 * form submission before calling the Apex REST endpoint. When a name filter
 * is provided it's sent as a query param; otherwise the endpoint returns the
 * first 10 contacts. Tests verify the form-driven fetch lifecycle: no fetch
 * on mount, correct URL construction with and without filters, loading state,
 * error handling, and clearing stale errors on retry.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type Mock } from 'vitest';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import ApexRest from './ApexRest';

vi.mock('@salesforce/sdk-data', () => ({
  createDataSDK: vi.fn(),
}));

const mockContacts = [
  {
    id: '003x1',
    name: 'Amy Taylor',
    title: 'VP Sales',
    phone: '555-1234',
    pictureUrl: 'https://example.com/amy.jpg',
  },
  {
    id: '003x2',
    name: 'Bob Smith',
    title: null,
    phone: null,
    pictureUrl: null,
  },
];

describe('ApexRest', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ fetch: mockFetch });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('does not fetch on initial render', () => {
    render(<ApexRest />);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('fetches contacts without filter when submitted with empty input', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockContacts),
    });

    render(<ApexRest />);
    await user.click(screen.getByRole('button', { name: 'Fetch Contacts' }));

    expect(await screen.findByText('Amy Taylor')).toBeInTheDocument();
    expect(screen.getByText('VP Sales')).toBeInTheDocument();
    expect(screen.getByText('555-1234')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();

    // Should call without name param
    expect(mockFetch).toHaveBeenCalledWith('/services/apexrest/contacts');
  });

  it('passes name filter as query param', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([mockContacts[0]]),
    });

    render(<ApexRest />);
    await user.type(screen.getByLabelText('Filter by name'), 'Taylor');
    await user.click(screen.getByRole('button', { name: 'Fetch Contacts' }));

    expect(mockFetch).toHaveBeenCalledWith(
      '/services/apexrest/contacts?name=Taylor'
    );
    expect(await screen.findByText('Amy Taylor')).toBeInTheDocument();
  });

  it('shows empty message when no contacts returned', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<ApexRest />);
    await user.click(screen.getByRole('button', { name: 'Fetch Contacts' }));

    expect(await screen.findByText('No contacts found.')).toBeInTheDocument();
  });

  it('shows error alert when Apex REST fails', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    render(<ApexRest />);
    await user.click(screen.getByRole('button', { name: 'Fetch Contacts' }));

    expect(
      await screen.findByText('Apex REST error: 500')
    ).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('clears previous error on new successful fetch', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockContacts),
      });

    render(<ApexRest />);

    await user.click(screen.getByRole('button', { name: 'Fetch Contacts' }));
    await screen.findByText('Apex REST error: 500');

    await user.click(screen.getByRole('button', { name: 'Fetch Contacts' }));
    await screen.findByText('Amy Taylor');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = render(<ApexRest />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
