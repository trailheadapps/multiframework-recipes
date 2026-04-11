/**
 * The component manages loading, error, and empty states as a discriminated
 * union — the React equivalent of handling @wire's data/error in LWC. We mock
 * the Salesforce SDK's graphql method so each test can resolve, reject, or pend
 * the promise to exercise every branch of the state machine. The simulation
 * buttons bypass the real fetch and set state directly, so those tests just
 * click and assert without awaiting network activity.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import LoadingErrorEmpty from './LoadingErrorEmpty';

const mockGraphql = vi.fn();

vi.mock('@salesforce/sdk-data', () => ({
  createDataSDK: vi.fn(() => Promise.resolve({ graphql: mockGraphql })),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}));

vi.mock('@salesforce/design-system-react', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const CONTACTS_SUCCESS = {
  data: {
    uiapi: {
      query: {
        Contact: {
          edges: [
            {
              node: {
                Id: '003x1',
                Name: { value: 'Amy Taylor' },
                Title: { value: 'VP Sales' },
                Phone: { value: '555-1234' },
                Picture__c: { value: 'https://example.com/amy.jpg' },
              },
            },
            {
              node: {
                Id: '003x2',
                Name: { value: 'Bob Smith' },
                Title: null,
                Phone: null,
                Picture__c: null,
              },
            },
          ],
        },
      },
    },
  },
};

const CONTACTS_EMPTY = {
  data: {
    uiapi: {
      query: {
        Contact: { edges: [] },
      },
    },
  },
};

describe('LoadingErrorEmpty', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading skeleton on initial render', () => {
    mockGraphql.mockReturnValue(new Promise(() => {}));
    render(<LoadingErrorEmpty />);
    expect(screen.queryByText('No Contacts Found')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders contacts after data loads', async () => {
    mockGraphql.mockResolvedValue(CONTACTS_SUCCESS);
    render(<LoadingErrorEmpty />);
    expect(await screen.findByText('Amy Taylor')).toBeInTheDocument();
    expect(screen.getByText('VP Sales')).toBeInTheDocument();
    expect(screen.getByText('555-1234')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
  });

  it('renders empty state when contacts array is empty', async () => {
    mockGraphql.mockResolvedValue(CONTACTS_EMPTY);
    render(<LoadingErrorEmpty />);
    expect(await screen.findByText('No Contacts Found')).toBeInTheDocument();
  });

  it('renders error alert when fetch rejects', async () => {
    mockGraphql.mockRejectedValue(new Error('Network failure'));
    render(<LoadingErrorEmpty />);
    expect(await screen.findByText('Network failure')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('Simulate: Error button shows error state', async () => {
    const user = userEvent.setup();
    mockGraphql.mockReturnValue(new Promise(() => {}));
    render(<LoadingErrorEmpty />);

    await user.click(screen.getByRole('button', { name: 'Simulate: Error' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Network request failed')).toBeInTheDocument();
  });

  it('Simulate: Empty button shows empty state', async () => {
    const user = userEvent.setup();
    mockGraphql.mockReturnValue(new Promise(() => {}));
    render(<LoadingErrorEmpty />);

    await user.click(screen.getByRole('button', { name: 'Simulate: Empty' }));
    expect(screen.getByText('No Contacts Found')).toBeInTheDocument();
  });

  it('Reload button re-fetches contacts', async () => {
    const user = userEvent.setup();
    mockGraphql.mockResolvedValue(CONTACTS_SUCCESS);
    render(<LoadingErrorEmpty />);

    await screen.findByText('Amy Taylor');
    expect(mockGraphql).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Reload' }));
    expect(mockGraphql).toHaveBeenCalledTimes(2);
  });

  it('is accessible', async () => {
    mockGraphql.mockResolvedValue(CONTACTS_SUCCESS);
    const { container } = render(<LoadingErrorEmpty />);
    await screen.findByText('Amy Taylor');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('loading state is accessible', async () => {
    mockGraphql.mockReturnValue(new Promise(() => {}));
    const { container } = render(<LoadingErrorEmpty />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('error state is accessible', async () => {
    mockGraphql.mockRejectedValue(new Error('Network failure'));
    const { container } = render(<LoadingErrorEmpty />);
    await screen.findByRole('alert');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('empty state is accessible', async () => {
    mockGraphql.mockResolvedValue(CONTACTS_EMPTY);
    const { container } = render(<LoadingErrorEmpty />);
    await screen.findByText('No Contacts Found');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Try Again button in error state re-fetches', async () => {
    const user = userEvent.setup();
    mockGraphql
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce(CONTACTS_SUCCESS);
    render(<LoadingErrorEmpty />);

    await screen.findByText('fail');
    await user.click(screen.getByRole('button', { name: 'Try Again' }));
    expect(await screen.findByText('Amy Taylor')).toBeInTheDocument();
  });
});
