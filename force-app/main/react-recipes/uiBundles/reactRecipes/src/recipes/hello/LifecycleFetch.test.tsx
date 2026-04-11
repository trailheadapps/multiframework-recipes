/**
 * LWC lifecycle is tested implicitly — connectedCallback runs when the element
 * is appended to the DOM and there is no first-class way to unmount in LWC Jest.
 * React components can be conditionally rendered, so we can test mount and
 * unmount by toggling a boolean in state. The tests below click the toggle
 * button to trigger React's equivalent of connectedCallback / disconnectedCallback.
 */
import { render, screen } from '@testing-library/react';
import { type Mock } from 'vitest';
import userEvent from '@testing-library/user-event';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import LifecycleFetch from './LifecycleFetch';

vi.mock('@salesforce/sdk-data', () => ({
  createDataSDK: vi.fn(),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const contactResponse = (title: string | null) => ({
  data: {
    uiapi: {
      query: {
        Contact: {
          edges: [
            {
              node: {
                Id: '003',
                Name: { value: 'Amy Taylor' },
                Title: { value: title },
              },
            },
          ],
        },
      },
    },
  },
  errors: [],
});

describe('LifecycleFetch', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ graphql: mockGraphql });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the contact name and title after data loads', async () => {
    mockGraphql.mockResolvedValue(contactResponse('VP Sales'));
    render(<LifecycleFetch />);
    expect(await screen.findByText('Amy Taylor')).toBeInTheDocument();
    expect(screen.getByText('VP Sales')).toBeInTheDocument();
  });

  it('unmounts the contact fetcher when the toggle button is clicked', async () => {
    const user = userEvent.setup();
    mockGraphql.mockReturnValue(new Promise(() => {}));
    render(<LifecycleFetch />);

    // Clicking unmounts the child component — its useEffect cleanup runs, which
    // is the React equivalent of disconnectedCallback in LWC.
    await user.click(
      screen.getByRole('button', { name: 'Unmount Contact Fetcher' })
    );

    expect(screen.queryByText('Fetching contact…')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Mount Contact Fetcher' })
    ).toBeInTheDocument();
  });

  it('remounts the contact fetcher and re-fetches when toggled back on', async () => {
    const user = userEvent.setup();
    mockGraphql.mockResolvedValue(contactResponse('VP Sales'));
    render(<LifecycleFetch />);

    // Wait for initial load then unmount
    await screen.findByText('Amy Taylor');
    await user.click(
      screen.getByRole('button', { name: 'Unmount Contact Fetcher' })
    );
    expect(screen.queryByText('Amy Taylor')).not.toBeInTheDocument();

    // Remount — fetches again
    await user.click(
      screen.getByRole('button', { name: 'Mount Contact Fetcher' })
    );
    expect(await screen.findByText('Amy Taylor')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    mockGraphql.mockResolvedValue(contactResponse('VP Sales'));
    const { container } = render(<LifecycleFetch />);
    await screen.findByText('Amy Taylor');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
