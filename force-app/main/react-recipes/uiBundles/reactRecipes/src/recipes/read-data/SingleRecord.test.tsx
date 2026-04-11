/**
 * In LWC, @wire(getRecord) returns record.fields.Name.value; here the same
 * data arrives as edges[0].node.Name.value via the Relay connection shape.
 * The mock fixture mirrors that nesting so the unwrap logic is exercised
 * end-to-end rather than short-circuited by a flat mock.
 */
import { render, screen } from '@testing-library/react';
import { type Mock } from 'vitest';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import SingleRecord from './SingleRecord';

vi.mock('@salesforce/sdk-data', () => ({
  createDataSDK: vi.fn(),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const SINGLE_SUCCESS = {
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
                Phone: { value: null },
                Picture__c: { value: null },
              },
            },
          ],
        },
      },
    },
  },
  errors: [],
};

describe('SingleRecord', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ graphql: mockGraphql });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the contact's name and title when data arrives", async () => {
    mockGraphql.mockResolvedValue(SINGLE_SUCCESS);
    render(<SingleRecord />);
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Engineer')).toBeInTheDocument();
  });

  it('renders "No contacts found." when edges array is empty', async () => {
    mockGraphql.mockResolvedValue({
      data: {
        uiapi: { query: { Contact: { edges: [] } } },
      },
      errors: [],
    });
    render(<SingleRecord />);
    expect(await screen.findByText('No contacts found.')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    mockGraphql.mockResolvedValue(SINGLE_SUCCESS);
    const { container } = render(<SingleRecord />);
    await screen.findByText('Alice');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

});
