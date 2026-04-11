/**
 * LWC's @wire re-fetches automatically; there's no direct equivalent to a
 * manual refresh. Here the fetch function is extracted with useCallback so
 * a button click triggers a second createDataSDK call. The test chains
 * mockResolvedValue calls and asserts the fetch counter increments.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { type Mock } from 'vitest';
import userEvent from '@testing-library/user-event';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import ImperativeRefetch from './ImperativeRefetch';

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

describe('ImperativeRefetch', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ graphql: mockGraphql });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders contacts and "Fetched 1 time" after the initial fetch', async () => {
    mockGraphql.mockResolvedValue(CONTACTS_SUCCESS);
    render(<ImperativeRefetch />);
    expect(await screen.findByText('Fetched 1 time')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('clicking "Refresh" re-fetches and increments to "Fetched 2 times"', async () => {
    const user = userEvent.setup();
    mockGraphql.mockResolvedValue(CONTACTS_SUCCESS);
    render(<ImperativeRefetch />);
    await screen.findByText('Fetched 1 time');

    await user.click(screen.getByRole('button', { name: 'Refresh' }));

    expect(await screen.findByText('Fetched 2 times')).toBeInTheDocument();
  });

  it('shows "Refreshing…" and disables the button while a manual refresh is in flight', async () => {
    mockGraphql
      .mockResolvedValueOnce(CONTACTS_SUCCESS)
      .mockReturnValueOnce(new Promise(() => {}));
    render(<ImperativeRefetch />);
    await screen.findByText('Fetched 1 time');

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));

    expect(screen.getByRole('button', { name: 'Refreshing…' })).toBeDisabled();
  });

  it('is accessible', async () => {
    mockGraphql.mockResolvedValue(CONTACTS_SUCCESS);
    const { container } = render(<ImperativeRefetch />);
    await screen.findByText('Alice');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

});
