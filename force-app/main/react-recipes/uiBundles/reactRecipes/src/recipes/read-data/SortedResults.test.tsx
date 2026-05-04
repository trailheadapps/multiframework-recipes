/**
 * In LWC, changing a reactive @wire property re-runs the adapter; here
 * userEvent.selectOptions triggers a re-render that causes useEffect to
 * re-run. UIAPI orderBy can't be a variable, so the test asserts on
 * the rebuilt query string (stringContaining) rather than a variables object.
 */
import { render, screen } from '@testing-library/react';
import { type Mock } from 'vitest';
import userEvent from '@testing-library/user-event';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import SortedResults from './SortedResults';

vi.mock('@salesforce/sdk-data', () => ({
  createDataSDK: vi.fn(),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const CONTACTS_SUCCESS = {
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
              },
            },
            {
              node: {
                Id: '003B',
                Name: { value: 'Bob' },
                Title: { value: null },
              },
            },
          ],
        },
      },
    },
  },
  errors: [],
};

describe('SortedResults', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ graphql: mockGraphql });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders contacts after the initial fetch', async () => {
    mockGraphql.mockResolvedValue(CONTACTS_SUCCESS);
    render(<SortedResults />);
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('refetches with a query containing the new field name when Sort by changes', async () => {
    const user = userEvent.setup();
    mockGraphql.mockResolvedValue(CONTACTS_SUCCESS);
    render(<SortedResults />);
    await screen.findByText('Alice');

    await user.selectOptions(screen.getByLabelText('Sort by'), 'Title');

    await screen.findByText('Alice');
    expect(mockGraphql).toHaveBeenLastCalledWith(
      expect.objectContaining({ query: expect.stringContaining('Title') })
    );
  });

  it('refetches with a query containing the new direction when Direction changes', async () => {
    const user = userEvent.setup();
    mockGraphql.mockResolvedValue(CONTACTS_SUCCESS);
    render(<SortedResults />);
    await screen.findByText('Alice');

    await user.selectOptions(screen.getByLabelText('Direction'), 'DESC');

    await screen.findByText('Alice');
    expect(mockGraphql).toHaveBeenLastCalledWith(
      expect.objectContaining({ query: expect.stringContaining('DESC') })
    );
  });

  it('is accessible', async () => {
    mockGraphql.mockResolvedValue(CONTACTS_SUCCESS);
    const { container } = render(<SortedResults />);
    await screen.findByText('Alice');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

});
