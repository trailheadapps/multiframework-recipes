import { render, screen } from '@testing-library/react';
import { type Mock } from 'vitest';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import DashboardAliasedQueries from './DashboardAliasedQueries';

vi.mock('@salesforce/sdk-data', () => ({
  createDataSDK: vi.fn(),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const DASHBOARD_SUCCESS = {
  data: {
    uiapi: {
      query: {
        accounts: {
          edges: [{ node: { Id: '001' } }, { node: { Id: '002' } }, { node: { Id: '003' } }],
        },
        contacts: {
          edges: [{ node: { Id: '003A' } }],
        },
        opportunities: {
          edges: [{ node: { Id: '006A' } }, { node: { Id: '006B' } }],
        },
      },
    },
  },
  errors: [],
};

describe('DashboardAliasedQueries', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ graphql: mockGraphql });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockGraphql.mockReturnValue(new Promise(() => {}));
    render(<DashboardAliasedQueries />);
    expect(screen.getByText('Loading\u2026')).toBeInTheDocument();
  });

  it('renders stat cards with correct counts', async () => {
    mockGraphql.mockResolvedValue(DASHBOARD_SUCCESS);
    render(<DashboardAliasedQueries />);
    expect(await screen.findByText('3')).toBeInTheDocument();
    expect(screen.getByText('Accounts')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Contacts')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Opportunities')).toBeInTheDocument();
  });

  it('renders error state on failure', async () => {
    mockGraphql.mockRejectedValue(new Error('GraphQL error'));
    render(<DashboardAliasedQueries />);
    expect(await screen.findByText('GraphQL error')).toBeInTheDocument();
  });

  it('renders zero counts for empty edges', async () => {
    mockGraphql.mockResolvedValue({
      data: {
        uiapi: {
          query: {
            accounts: { edges: [] },
            contacts: { edges: [] },
            opportunities: { edges: [] },
          },
        },
      },
      errors: [],
    });
    render(<DashboardAliasedQueries />);
    expect(await screen.findByText('Accounts')).toBeInTheDocument();
    const zeroes = screen.getAllByText('0');
    expect(zeroes).toHaveLength(3);
  });

  it('is accessible', async () => {
    mockGraphql.mockResolvedValue(DASHBOARD_SUCCESS);
    const { container } = render(<DashboardAliasedQueries />);
    await screen.findByText('Accounts');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
