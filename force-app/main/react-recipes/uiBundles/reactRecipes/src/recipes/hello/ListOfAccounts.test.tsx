/**
 * The vi.mock() call below intercepts the @salesforce/sdk-data module for the
 * entire test file. In LWC Jest the equivalent is registering a wire adapter
 * mock — here there is no wire adapter, so a plain module mock is enough.
 * The mock data objects mirror the real UIAPI GraphQL response shape so the
 * component's data-mapping code is exercised, not bypassed.
 */
import { render, screen } from '@testing-library/react';
import { type Mock } from 'vitest';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import ListOfAccounts from './ListOfAccounts';

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
                Id: '001',
                Name: { value: 'Acme Corp' },
                Industry: { value: 'Technology' },
              },
            },
            {
              node: {
                Id: '002',
                Name: { value: 'Globex' },
                Industry: { value: null },
              },
            },
          ],
        },
      },
    },
  },
  errors: [],
};

describe('ListOfAccounts', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ graphql: mockGraphql });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders all account names after data loads', async () => {
    mockGraphql.mockResolvedValue(ACCOUNTS_SUCCESS);
    render(<ListOfAccounts />);
    expect(await screen.findByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Globex')).toBeInTheDocument();
  });

  it('omits the industry row when industry is null', async () => {
    mockGraphql.mockResolvedValue(ACCOUNTS_SUCCESS);
    render(<ListOfAccounts />);
    await screen.findByText('Globex');
    // Globex has null industry — only one industry label should be in the DOM
    expect(screen.getAllByText('Technology')).toHaveLength(1);
  });

  it('is accessible', async () => {
    mockGraphql.mockResolvedValue(ACCOUNTS_SUCCESS);
    const { container } = render(<ListOfAccounts />);
    await screen.findByText('Acme Corp');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

});
