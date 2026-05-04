import { render, screen, fireEvent, act } from '@testing-library/react';
import { type Mock } from 'vitest';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import SearchableAccountList from './SearchableAccountList';

vi.mock('@salesforce/sdk-data', () => ({
  createDataSDK: vi.fn(),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const ACCOUNTS_SUCCESS = {
  data: {
    uiapi: {
      query: {
        Account: {
          edges: [
            {
              node: {
                Id: '001A',
                Name: { value: 'Acme Corp' },
                Industry: { value: 'Technology' },
              },
            },
            {
              node: {
                Id: '001B',
                Name: { value: 'Global Media' },
                Industry: { value: 'Media' },
              },
            },
          ],
        },
      },
    },
  },
  errors: [],
};

const SINGLE_RESULT = {
  data: {
    uiapi: {
      query: {
        Account: {
          edges: [
            {
              node: {
                Id: '001A',
                Name: { value: 'Acme Corp' },
                Industry: { value: 'Technology' },
              },
            },
          ],
        },
      },
    },
  },
  errors: [],
};

const EMPTY_RESULT = {
  data: {
    uiapi: {
      query: {
        Account: {
          edges: [],
        },
      },
    },
  },
  errors: [],
};

describe('SearchableAccountList', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ graphql: mockGraphql });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('renders search input on mount', async () => {
    mockGraphql.mockResolvedValue(ACCOUNTS_SUCCESS);
    await act(async () => {
      render(<SearchableAccountList />);
    });
    expect(
      screen.getByPlaceholderText('Search accounts by name\u2026')
    ).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    mockGraphql.mockReturnValue(new Promise(() => {}));
    render(<SearchableAccountList />);
    expect(screen.getByText('Searching\u2026')).toBeInTheDocument();
  });

  it('displays accounts after data loads', async () => {
    mockGraphql.mockResolvedValue(ACCOUNTS_SUCCESS);
    await act(async () => {
      render(<SearchableAccountList />);
    });
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Global Media')).toBeInTheDocument();
    expect(screen.getByText('Media')).toBeInTheDocument();
  });

  it('searches after debounce when user types', async () => {
    mockGraphql.mockResolvedValue(ACCOUNTS_SUCCESS);
    await act(async () => {
      render(<SearchableAccountList />);
    });

    mockGraphql.mockResolvedValue(SINGLE_RESULT);
    fireEvent.change(
      screen.getByPlaceholderText('Search accounts by name\u2026'),
      { target: { value: 'Acme' } }
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });
    expect(mockGraphql).toHaveBeenCalledWith({
      query: expect.any(String),
      variables: { name: '%Acme%' },
    });
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('shows empty state when no results match', async () => {
    mockGraphql.mockResolvedValue(ACCOUNTS_SUCCESS);
    await act(async () => {
      render(<SearchableAccountList />);
    });

    mockGraphql.mockResolvedValue(EMPTY_RESULT);
    fireEvent.change(
      screen.getByPlaceholderText('Search accounts by name\u2026'),
      { target: { value: 'zzz' } }
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });
    expect(screen.getByText(/No accounts match/)).toBeInTheDocument();
  });

  it('shows error message on failure', async () => {
    mockGraphql.mockRejectedValue(new Error('Network error'));
    await act(async () => {
      render(<SearchableAccountList />);
    });
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    vi.useRealTimers();
    mockGraphql.mockResolvedValue(ACCOUNTS_SUCCESS);
    let container: HTMLElement;
    await act(async () => {
      ({ container } = render(<SearchableAccountList />));
    });
    const results = await axe(container!);
    expect(results).toHaveNoViolations();
  });

  it('error state is accessible', async () => {
    vi.useRealTimers();
    mockGraphql.mockRejectedValue(new Error('Network error'));
    let container: HTMLElement;
    await act(async () => {
      ({ container } = render(<SearchableAccountList />));
    });
    const results = await axe(container!);
    expect(results).toHaveNoViolations();
  });
});
