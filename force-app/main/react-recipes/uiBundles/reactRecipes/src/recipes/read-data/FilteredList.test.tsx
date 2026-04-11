/**
 * In LWC, updating a reactive @wire property re-runs the adapter
 * synchronously in tests. Here the fetch is debounced, so tests call
 * vi.useFakeTimers() and vi.advanceTimersByTimeAsync(350) to advance past
 * the 300 ms delay before asserting results.
 */
import { render, screen, fireEvent, act } from '@testing-library/react';
import { type Mock } from 'vitest';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import FilteredList from './FilteredList';

vi.mock('@salesforce/sdk-data', () => ({
  createDataSDK: vi.fn(),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const FILTERED_SUCCESS = {
  data: {
    uiapi: {
      query: {
        Contact: {
          edges: [
            {
              node: {
                Id: '003A',
                Name: { value: 'Alice' },
                Title: { value: null },
                Phone: { value: null },
                Picture__c: { value: null },
              },
            },
          ],
        },
      },
    },
  },
  errors: [],
};

describe('FilteredList', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ graphql: mockGraphql });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('renders the search input on mount without fetching', () => {
    render(<FilteredList />);
    expect(screen.getByPlaceholderText('Search by name…')).toBeInTheDocument();
    expect(mockGraphql).not.toHaveBeenCalled();
  });

  it('shows "Loading…" after the debounce fires when fetch is pending', async () => {
    mockGraphql.mockReturnValue(new Promise(() => {}));
    render(<FilteredList />);
    fireEvent.change(screen.getByPlaceholderText('Search by name…'), {
      target: { value: 'Alice' },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('renders matching contacts after debounce and fetch resolve', async () => {
    mockGraphql.mockResolvedValue(FILTERED_SUCCESS);
    render(<FilteredList />);
    fireEvent.change(screen.getByPlaceholderText('Search by name…'), {
      target: { value: 'Alice' },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });
    // findByText polls with setTimeout internally; with fake timers active that
    // never fires, so assert synchronously — act() already flushed state updates.
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('shows "No contacts found." when query returns empty edges', async () => {
    mockGraphql.mockResolvedValue({
      data: { uiapi: { query: { Contact: { edges: [] } } } },
      errors: [],
    });
    render(<FilteredList />);
    fireEvent.change(screen.getByPlaceholderText('Search by name…'), {
      target: { value: 'zzz' },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });
    expect(screen.getByText('No contacts found.')).toBeInTheDocument();
  });

  it('passes the search term wrapped in %…% as a GraphQL variable', async () => {
    mockGraphql.mockResolvedValue(FILTERED_SUCCESS);
    render(<FilteredList />);
    fireEvent.change(screen.getByPlaceholderText('Search by name…'), {
      target: { value: 'Alice' },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(mockGraphql).toHaveBeenCalledWith(expect.any(String), {
      name: '%Alice%',
    });
  });

  it('is accessible', async () => {
    vi.useRealTimers();
    const { container } = render(<FilteredList />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
