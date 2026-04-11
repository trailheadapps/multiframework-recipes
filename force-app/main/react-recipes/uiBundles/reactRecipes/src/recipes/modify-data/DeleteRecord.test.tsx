// In LWC you'd call deleteRecord() from lightning/uiRecordApi, which
// automatically removes the record from the @wire cache. Here there is no
// cache — the row is removed from local state with setAccounts(prev =>
// prev.filter(...)). Tests drive the two-step confirmation flow (Delete →
// Yes, Delete) via userEvent and assert DOM changes directly.
import { render, screen, waitFor } from '@testing-library/react';
import { type Mock } from 'vitest';
import userEvent from '@testing-library/user-event';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import DeleteRecord from './DeleteRecord';

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

const DELETE_SUCCESS = {
  data: { uiapi: { AccountDelete: { Id: '001' } } },
  errors: [],
};

describe('DeleteRecord', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ graphql: mockGraphql });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows confirmation buttons when Delete is clicked', async () => {
    const user = userEvent.setup();
    mockGraphql.mockResolvedValue(LIST_SUCCESS);
    render(<DeleteRecord />);
    await screen.findByText('Acme Corp');

    // Click the first Delete button (Acme Corp's row)
    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);

    expect(screen.getByRole('button', { name: 'Yes, Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    // The original Delete button for that row should no longer be shown
    expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(1);
  });

  it('restores the Delete button when Cancel is clicked', async () => {
    const user = userEvent.setup();
    mockGraphql.mockResolvedValue(LIST_SUCCESS);
    render(<DeleteRecord />);
    await screen.findByText('Acme Corp');

    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('button', { name: 'Yes, Delete' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(2);
  });

  it('removes the row from the table after a successful deletion', async () => {
    const user = userEvent.setup();
    // First call: list load. Second call: delete mutation.
    mockGraphql
      .mockResolvedValueOnce(LIST_SUCCESS)
      .mockResolvedValueOnce(DELETE_SUCCESS);
    render(<DeleteRecord />);
    await screen.findByText('Acme Corp');

    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    await user.click(screen.getByRole('button', { name: 'Yes, Delete' }));

    // waitFor polls until the async deletion completes and React removes the row.
    // No re-fetch is needed — the row is removed directly from local state.
    await waitFor(() => {
      expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Globex')).toBeInTheDocument();
  });

  it('calls the delete mutation with the correct record Id', async () => {
    const user = userEvent.setup();
    mockGraphql
      .mockResolvedValueOnce(LIST_SUCCESS)
      .mockResolvedValueOnce(DELETE_SUCCESS);
    render(<DeleteRecord />);
    await screen.findByText('Acme Corp');

    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    await user.click(screen.getByRole('button', { name: 'Yes, Delete' }));

    // Assert after the row disappears so the async call has definitely completed
    await waitFor(() =>
      expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument()
    );
    expect(mockGraphql).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.objectContaining({ input: { Id: '001' } })
    );
  });

  it('shows "Deleting…" in the row while the mutation is in flight', async () => {
    const user = userEvent.setup();
    mockGraphql
      .mockResolvedValueOnce(LIST_SUCCESS)
      .mockReturnValueOnce(new Promise(() => {})); // delete never resolves
    render(<DeleteRecord />);
    await screen.findByText('Acme Corp');

    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    await user.click(screen.getByRole('button', { name: 'Yes, Delete' }));

    expect(screen.getByText('Deleting…')).toBeInTheDocument();
  });

  it('disables all Delete buttons while a deletion is in flight', async () => {
    const user = userEvent.setup();
    mockGraphql
      .mockResolvedValueOnce(LIST_SUCCESS)
      .mockReturnValueOnce(new Promise(() => {}));
    render(<DeleteRecord />);
    await screen.findByText('Acme Corp');

    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    await user.click(screen.getByRole('button', { name: 'Yes, Delete' }));

    // The other row's Delete button should be disabled while a deletion is pending
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });

  it('is accessible', async () => {
    mockGraphql.mockResolvedValue(LIST_SUCCESS);
    const { container } = render(<DeleteRecord />);
    await screen.findByText('Acme Corp');
    // The actions column header is intentionally empty in this recipe
    const results = await axe(container, {
      rules: { 'empty-table-header': { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });

});
