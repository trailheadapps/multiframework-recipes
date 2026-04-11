/**
 * In LWC Jest you test @api props by setting them directly on the element:
 *   el.name = 'Acme Corp'; await Promise.resolve();
 *   expect(el.shadowRoot.querySelector('strong').textContent).toBe('Acme Corp');
 *
 * Here props are tested by rendering the parent component (which fetches the
 * data and passes it down) and asserting on what appears in the document. The
 * child component AccountCard has no test of its own — integration at the
 * parent level covers the full data-to-UI path.
 */
import { render, screen } from '@testing-library/react';
import { type Mock } from 'vitest';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import ParentToChild from './ParentToChild';

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

describe('ParentToChild', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ graphql: mockGraphql });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('passes account name and industry to each child card', async () => {
    mockGraphql.mockResolvedValue(ACCOUNTS_SUCCESS);
    render(<ParentToChild />);
    expect(await screen.findByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Globex')).toBeInTheDocument();
  });

  it('renders "No Industry" when industry is null', async () => {
    mockGraphql.mockResolvedValue(ACCOUNTS_SUCCESS);
    render(<ParentToChild />);
    await screen.findByText('Globex');
    expect(screen.getByText('No Industry')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    mockGraphql.mockResolvedValue(ACCOUNTS_SUCCESS);
    const { container } = render(<ParentToChild />);
    await screen.findByText('Acme Corp');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

});
