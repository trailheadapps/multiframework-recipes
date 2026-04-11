/**
 * LWC has no built-in pagination wire adapter, so this pattern is React-
 * specific. Use mockResolvedValueOnce chained calls to simulate successive
 * pages, and assert that the second graphql call receives the endCursor
 * from pageInfo as its $after variable.
 */
import { render, screen } from '@testing-library/react';
import { type Mock } from 'vitest';
import userEvent from '@testing-library/user-event';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import PaginatedList from './PaginatedList';

vi.mock('@salesforce/sdk-data', () => ({
  createDataSDK: vi.fn(),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const PAGE_1 = {
  data: {
    uiapi: {
      query: {
        Contact: {
          pageInfo: { hasNextPage: true, endCursor: 'cursor1' },
          edges: [
            {
              node: {
                Id: '003A',
                Name: { value: 'Alice' },
                Title: { value: null },
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

const PAGE_FINAL = {
  data: {
    uiapi: {
      query: {
        Contact: {
          pageInfo: { hasNextPage: false, endCursor: null },
          edges: [
            {
              node: {
                Id: '003A',
                Name: { value: 'Alice' },
                Title: { value: null },
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

const PAGE_2 = {
  data: {
    uiapi: {
      query: {
        Contact: {
          pageInfo: { hasNextPage: false, endCursor: null },
          edges: [
            {
              node: {
                Id: '003C',
                Name: { value: 'Carol' },
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

describe('PaginatedList', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ graphql: mockGraphql });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders contacts from the first page', async () => {
    mockGraphql.mockResolvedValue(PAGE_1);
    render(<PaginatedList />);
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('shows "Load More" button when hasNextPage is true', async () => {
    mockGraphql.mockResolvedValue(PAGE_1);
    render(<PaginatedList />);
    expect(
      await screen.findByRole('button', { name: 'Load More' })
    ).toBeInTheDocument();
  });

  it('shows "All X contacts loaded." and hides "Load More" when hasNextPage is false', async () => {
    mockGraphql.mockResolvedValue(PAGE_FINAL);
    render(<PaginatedList />);
    expect(
      await screen.findByText('All 2 contacts loaded.')
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Load More' })
    ).not.toBeInTheDocument();
  });

  it('clicking "Load More" appends the next page to the existing list', async () => {
    const user = userEvent.setup();
    mockGraphql.mockResolvedValueOnce(PAGE_1).mockResolvedValueOnce(PAGE_2);
    render(<PaginatedList />);
    await screen.findByRole('button', { name: 'Load More' });
    await user.click(screen.getByRole('button', { name: 'Load More' }));
    expect(await screen.findByText('Carol')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('passes endCursor as the after variable on the second call', async () => {
    const user = userEvent.setup();
    mockGraphql.mockResolvedValueOnce(PAGE_1).mockResolvedValueOnce(PAGE_2);
    render(<PaginatedList />);
    await screen.findByRole('button', { name: 'Load More' });
    await user.click(screen.getByRole('button', { name: 'Load More' }));
    await screen.findByText('Carol');
    expect(mockGraphql).toHaveBeenLastCalledWith(expect.any(String), {
      after: 'cursor1',
    });
  });

  it('is accessible', async () => {
    mockGraphql.mockResolvedValue(PAGE_1);
    const { container } = render(<PaginatedList />);
    await screen.findByText('Alice');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
