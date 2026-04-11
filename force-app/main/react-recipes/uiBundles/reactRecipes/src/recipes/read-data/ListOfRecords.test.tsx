/**
 * In LWC you'd mock a @wire adapter with registerLdsTestWireAdapter and
 * call emit() with fixture data. Here, createDataSDK is mocked as an async
 * function so the component's useEffect fetch resolves in test. Use findBy*
 * (not getBy*) to wait for state updates after the promise resolves.
 */
import { render, screen } from '@testing-library/react';
import { type Mock } from 'vitest';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import ListOfRecords from './ListOfRecords';

vi.mock('@salesforce/sdk-data', () => ({
  createDataSDK: vi.fn(),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const LIST_SUCCESS = {
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
                Phone: { value: '555-1111' },
                Picture__c: { value: 'https://example.com/alice.jpg' },
              },
            },
            {
              node: {
                Id: '003B',
                Name: { value: 'Bob' },
                Title: { value: null },
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

describe('ListOfRecords', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ graphql: mockGraphql });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders contact names from edges after fetch resolves', async () => {
    mockGraphql.mockResolvedValue(LIST_SUCCESS);
    render(<ListOfRecords />);
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('renders a tel: link for contacts with a phone number', async () => {
    mockGraphql.mockResolvedValue(LIST_SUCCESS);
    render(<ListOfRecords />);
    await screen.findByText('Alice');
    const link = screen.getByRole('link', { name: '555-1111' });
    expect(link).toHaveAttribute('href', 'tel:555-1111');
  });

  it('is accessible', async () => {
    mockGraphql.mockResolvedValue(LIST_SUCCESS);
    const { container } = render(<ListOfRecords />);
    await screen.findByText('Alice');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

});
