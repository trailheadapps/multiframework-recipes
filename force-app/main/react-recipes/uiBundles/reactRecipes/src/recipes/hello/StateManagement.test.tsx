/**
 * In LWC, sibling-to-sibling communication typically requires the Lightning
 * Message Service (LMS), and tests mock the LMS channel. Here siblings share
 * state via a common parent (lifting state up), so there is no message service
 * to mock — clicking a button in one sibling just updates parent state, which
 * React re-renders into the other sibling automatically.
 */
import { render, screen } from '@testing-library/react';
import { type Mock } from 'vitest';
import userEvent from '@testing-library/user-event';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import StateManagement from './StateManagement';

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
                Industry: { value: 'Finance' },
              },
            },
          ],
        },
      },
    },
  },
  errors: [],
};

describe('StateManagement', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ graphql: mockGraphql });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('updates the detail panel when an account is selected', async () => {
    const user = userEvent.setup();
    mockGraphql.mockResolvedValue(ACCOUNTS_SUCCESS);
    render(<StateManagement />);

    // userEvent.click() on the selector button triggers onSelect, which updates
    // selectedId in the parent — the detail panel re-renders without any event bus.
    await user.click(await screen.findByRole('button', { name: 'Acme Corp' }));

    expect(screen.queryByText('Select an account')).not.toBeInTheDocument();
    // Industry is only rendered in the detail panel, not in the selector
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('updates the detail panel when a different account is selected', async () => {
    const user = userEvent.setup();
    mockGraphql.mockResolvedValue(ACCOUNTS_SUCCESS);
    render(<StateManagement />);

    await user.click(await screen.findByRole('button', { name: 'Acme Corp' }));
    await user.click(screen.getByRole('button', { name: 'Globex' }));

    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.queryByText('Technology')).not.toBeInTheDocument();
  });

  it('is accessible', async () => {
    mockGraphql.mockResolvedValue(ACCOUNTS_SUCCESS);
    const { container } = render(<StateManagement />);
    await screen.findByText('Acme Corp');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

});
