// Unlike LWC where @wire(getRecord) auto-refreshes after updateRecord(), local
// state here is patched in place using the server response: the single changed
// row is mapped to a new object, other rows are left untouched. Tests verify
// this by asserting that only the edited row's text changes in the DOM.
import { render, screen, waitFor } from '@testing-library/react';
import { type Mock } from 'vitest';
import userEvent from '@testing-library/user-event';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import QueryMutationTogether from './QueryMutationTogether';

vi.mock('@salesforce/sdk-data', () => ({
  createDataSDK: vi.fn(),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const LIST_SUCCESS = {
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

const UPDATE_SUCCESS = {
  data: {
    uiapi: {
      AccountUpdate: {
        Record: {
          Id: '001',
          Name: { value: 'Acme Corp Renamed' },
          Industry: { value: 'Healthcare' },
        },
      },
    },
  },
  errors: [],
};

describe('QueryMutationTogether', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ graphql: mockGraphql });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('opens an inline form pre-filled with the row values when Edit is clicked', async () => {
    const user = userEvent.setup();
    mockGraphql.mockResolvedValue(LIST_SUCCESS);
    render(<QueryMutationTogether />);
    await screen.findByText('Acme Corp');

    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);

    // The inline form replaces the read-only row — a Save button appears
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    // The name input should be pre-filled with the current account name
    expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument();
  });

  it('closes the inline form and restores the row when Cancel is clicked', async () => {
    const user = userEvent.setup();
    mockGraphql.mockResolvedValue(LIST_SUCCESS);
    render(<QueryMutationTogether />);
    await screen.findByText('Acme Corp');

    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('disables other Edit buttons while one row is being edited', async () => {
    const user = userEvent.setup();
    mockGraphql.mockResolvedValue(LIST_SUCCESS);
    render(<QueryMutationTogether />);
    await screen.findByText('Acme Corp');

    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);

    // Only one row can be edited at a time — other Edit buttons are disabled
    expect(screen.getByRole('button', { name: 'Edit' })).toBeDisabled();
  });

  it('patches only the edited row in the table after a successful save', async () => {
    const user = userEvent.setup();
    mockGraphql
      .mockResolvedValueOnce(LIST_SUCCESS)
      .mockResolvedValueOnce(UPDATE_SUCCESS);
    render(<QueryMutationTogether />);
    await screen.findByText('Acme Corp');

    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    // The edited row shows server-returned values; the other row is unchanged
    expect(await screen.findByText('Acme Corp Renamed')).toBeInTheDocument();
    expect(screen.getByText('Healthcare')).toBeInTheDocument();
    expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument();
    expect(screen.getByText('Globex')).toBeInTheDocument();
  });

  it('calls the update mutation with the correct Id and field values', async () => {
    const user = userEvent.setup();
    mockGraphql
      .mockResolvedValueOnce(LIST_SUCCESS)
      .mockResolvedValueOnce(UPDATE_SUCCESS);
    render(<QueryMutationTogether />);
    await screen.findByText('Acme Corp');

    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument()
    );
    expect(mockGraphql).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.objectContaining({
        input: expect.objectContaining({ Id: '001' }),
      })
    );
  });

  it('shows an inline error and keeps the form open when the mutation fails', async () => {
    const user = userEvent.setup();
    mockGraphql
      .mockResolvedValueOnce(LIST_SUCCESS)
      .mockResolvedValueOnce({
        data: null,
        errors: [{ message: 'FIELD_INTEGRITY_EXCEPTION' }],
      });
    render(<QueryMutationTogether />);
    await screen.findByText('Acme Corp');

    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    // Error appears inline next to the form, not as a page-level alert
    expect(
      await screen.findByText('FIELD_INTEGRITY_EXCEPTION')
    ).toBeInTheDocument();
    // Form stays open so the user can correct and retry
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('is accessible', async () => {
    mockGraphql.mockResolvedValue(LIST_SUCCESS);
    const { container } = render(<QueryMutationTogether />);
    await screen.findByText('Acme Corp');
    // The actions column header is intentionally empty in this recipe
    const results = await axe(container, {
      rules: { 'empty-table-header': { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });

});
