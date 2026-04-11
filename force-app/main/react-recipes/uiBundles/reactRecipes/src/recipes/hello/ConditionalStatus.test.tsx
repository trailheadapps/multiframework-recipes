/**
 * LWC Jest tests conditional rendering by checking if an element exists in the
 * shadow DOM: expect(el.shadowRoot.querySelector('.badge')).not.toBeNull().
 * Here we query by the visible text instead — if the element isn't rendered,
 * its text won't appear in the document at all.
 */
import { render, screen } from '@testing-library/react';
import { type Mock } from 'vitest';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import ConditionalStatus from './ConditionalStatus';

vi.mock('@salesforce/sdk-data', () => ({
  createDataSDK: vi.fn(),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const accountResponse = (industry: string | null) => ({
  data: {
    uiapi: {
      query: {
        Account: {
          edges: [
            {
              node: {
                Id: '001',
                Name: { value: 'Acme Corp' },
                Industry: { value: industry },
              },
            },
          ],
        },
      },
    },
  },
  errors: [],
});

describe('ConditionalStatus', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ graphql: mockGraphql });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the account name and industry badge when industry is set', async () => {
    mockGraphql.mockResolvedValue(accountResponse('Technology'));
    render(<ConditionalStatus />);
    expect(await screen.findByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('renders the fallback badge when industry is null', async () => {
    mockGraphql.mockResolvedValue(accountResponse(null));
    render(<ConditionalStatus />);
    expect(await screen.findByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('No Industry Set')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    mockGraphql.mockResolvedValue(accountResponse('Technology'));
    const { container } = render(<ConditionalStatus />);
    await screen.findByText('Acme Corp');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

});
