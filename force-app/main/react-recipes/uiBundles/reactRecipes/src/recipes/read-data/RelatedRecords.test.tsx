/**
 * In LWC, fetching a parent record typically requires a second @wire call
 * or getRelatedListRecords but here single mock response carries both
 * Contact and Account fields; we nest Account under the node to
 * match the relationship traversal in the query.
 */
import { render, screen } from '@testing-library/react';
import { type Mock } from 'vitest';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import RelatedRecords from './RelatedRecords';

vi.mock('@salesforce/sdk-data', () => ({
  createDataSDK: vi.fn(),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const RELATED_SUCCESS = {
  data: {
    uiapi: {
      query: {
        Contact: {
          edges: [
            {
              node: {
                Id: '003A',
                Name: { value: 'Alice' },
                Title: { value: 'Engineer' },
                Account: { Name: { value: 'Acme Corp' } },
              },
            },
            {
              node: {
                Id: '003B',
                Name: { value: 'Bob' },
                Title: { value: null },
                Account: null,
              },
            },
          ],
        },
      },
    },
  },
  errors: [],
};

describe('RelatedRecords', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ graphql: mockGraphql });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders contact names alongside their related account names', async () => {
    mockGraphql.mockResolvedValue(RELATED_SUCCESS);
    render(<RelatedRecords />);
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('renders an em dash when a contact has no parent account', async () => {
    mockGraphql.mockResolvedValue(RELATED_SUCCESS);
    render(<RelatedRecords />);
    await screen.findByText('Bob');
    // The em dash is rendered inside an <em> element when Account is null
    const emDash = screen.getByText('—');
    expect(emDash.tagName.toLowerCase()).toBe('em');
  });

  it('is accessible', async () => {
    mockGraphql.mockResolvedValue(RELATED_SUCCESS);
    const { container } = render(<RelatedRecords />);
    await screen.findByText('Alice');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

});
