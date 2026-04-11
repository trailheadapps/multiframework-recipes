import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import AccountCardSLDS from './AccountCardSLDS';

const mockUseFirstAccount = vi.fn();

vi.mock('@/api/account', () => ({
  useFirstAccount: () => mockUseFirstAccount(),
}));

const MOCK_ACCOUNT = {
  Id: '001A',
  Name: { value: 'Acme Corp' },
  Industry: { value: 'Technology' },
  AnnualRevenue: { value: 5000000 },
};

describe('AccountCardSLDS', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseFirstAccount.mockReturnValue({ account: undefined, loading: true, error: undefined });
    render(<AccountCardSLDS />);
    expect(screen.getByText('Loading\u2026')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseFirstAccount.mockReturnValue({ account: undefined, loading: false, error: 'Something went wrong' });
    render(<AccountCardSLDS />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders empty state when no account found', () => {
    mockUseFirstAccount.mockReturnValue({ account: undefined, loading: false, error: undefined });
    render(<AccountCardSLDS />);
    expect(screen.getByText('No account found.')).toBeInTheDocument();
  });

  it('renders account card with data', () => {
    mockUseFirstAccount.mockReturnValue({ account: MOCK_ACCOUNT, loading: false, error: undefined });
    render(<AccountCardSLDS />);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Industry')).toBeInTheDocument();
    expect(screen.getByText('Annual Revenue')).toBeInTheDocument();
    expect(screen.getByText('View Account')).toBeInTheDocument();
  });

  it('formats revenue with compact notation', () => {
    mockUseFirstAccount.mockReturnValue({ account: MOCK_ACCOUNT, loading: false, error: undefined });
    render(<AccountCardSLDS />);
    expect(screen.getByText('$5.0M')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    mockUseFirstAccount.mockReturnValue({ account: MOCK_ACCOUNT, loading: false, error: undefined });
    const { container } = render(<AccountCardSLDS />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
