/**
 * In LWC, two @wire calls require two separate adapter mocks and two
 * emit() calls. Here a single mock resolves with both objects in one
 * response; the fixture keys (accounts, contacts) must match the query
 * aliases exactly or the component reads undefined.
 */
import { render, screen } from '@testing-library/react';
import { type Mock } from 'vitest';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import AliasedMultiObjectQuery from './AliasedMultiObjectQuery';

vi.mock('@salesforce/sdk-data', () => ({
  createDataSDK: vi.fn(),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const COUNTS_SUCCESS = {
  data: {
    uiapi: {
      query: {
        accounts: {
          edges: [{ node: { Id: '001' } }, { node: { Id: '002' } }],
        },
        contacts: {
          edges: [{ node: { Id: '003' } }],
        },
      },
    },
  },
  errors: [],
};

describe('AliasedMultiObjectQuery', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ graphql: mockGraphql });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the account count and contact count from aliased edges', async () => {
    mockGraphql.mockResolvedValue(COUNTS_SUCCESS);
    render(<AliasedMultiObjectQuery />);
    // StatCard renders the numeric count followed by the label
    expect(await screen.findByText('2')).toBeInTheDocument();
    expect(screen.getByText('Accounts')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Contacts')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    mockGraphql.mockResolvedValue(COUNTS_SUCCESS);
    const { container } = render(<AliasedMultiObjectQuery />);
    await screen.findByText('Accounts');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

});
