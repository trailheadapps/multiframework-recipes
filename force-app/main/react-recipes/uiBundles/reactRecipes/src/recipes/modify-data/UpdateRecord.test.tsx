// In LWC, updateRecord() from lightning/uiRecordApi automatically invalidates
// the @wire cache so sibling components refresh. Here local state is patched
// directly from the mutation response — useState is the cache. The same
// mockGraphql spy handles both the initial load query and the update mutation
// because both go through the same createDataSDK().graphql() call.
import { render, screen } from '@testing-library/react';
import { type Mock } from 'vitest';
import userEvent from '@testing-library/user-event';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import UpdateRecord from './UpdateRecord';

vi.mock('@salesforce/sdk-data', () => ({
  createDataSDK: vi.fn(),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const LOAD_SUCCESS = {
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
          Name: { value: 'Acme Corp Updated' },
          Industry: { value: 'Finance' },
        },
      },
    },
  },
  errors: [],
};

describe('UpdateRecord', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ graphql: mockGraphql });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('pre-populates the form with the loaded account data', async () => {
    mockGraphql.mockResolvedValue(LOAD_SUCCESS);
    render(<UpdateRecord />);
    // findByDisplayValue waits for the form to be populated after the async load
    expect(await screen.findByDisplayValue('Acme Corp')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Technology')).toBeInTheDocument();
  });

  it('disables the submit button and shows "Saving…" while the mutation is in flight', async () => {
    // First call resolves (load), second call never resolves (mutation in flight)
    mockGraphql
      .mockResolvedValueOnce(LOAD_SUCCESS)
      .mockReturnValueOnce(new Promise(() => {}));
    render(<UpdateRecord />);
    await screen.findByDisplayValue('Acme Corp');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
  });

  it('shows a success toast after the update completes', async () => {
    mockGraphql
      .mockResolvedValueOnce(LOAD_SUCCESS)
      .mockResolvedValueOnce(UPDATE_SUCCESS);
    render(<UpdateRecord />);
    await screen.findByDisplayValue('Acme Corp');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(await screen.findByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Account updated successfully.')).toBeInTheDocument();
  });

  it('syncs the form fields from the server response after a successful update', async () => {
    // The server may return normalised values (e.g. trimmed, formatted); the form
    // updates from the response rather than from what the user typed.
    mockGraphql
      .mockResolvedValueOnce(LOAD_SUCCESS)
      .mockResolvedValueOnce(UPDATE_SUCCESS);
    render(<UpdateRecord />);
    await screen.findByDisplayValue('Acme Corp');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    // Form now shows values returned by the server, not the pre-submission values
    expect(await screen.findByDisplayValue('Acme Corp Updated')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Finance')).toBeInTheDocument();
  });

  it('calls the update mutation with the account Id and form field values', async () => {
    mockGraphql
      .mockResolvedValueOnce(LOAD_SUCCESS)
      .mockResolvedValueOnce(UPDATE_SUCCESS);
    render(<UpdateRecord />);
    await screen.findByDisplayValue('Acme Corp');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    await screen.findByRole('status');

    // Id is a top-level field on the input, not nested inside Account —
    // verify the correct shape is sent to the mutation.
    expect(mockGraphql).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.objectContaining({
        input: expect.objectContaining({ Id: '001' }),
      })
    );
  });

  it('shows an error alert when the update mutation fails', async () => {
    mockGraphql
      .mockResolvedValueOnce(LOAD_SUCCESS)
      .mockResolvedValueOnce({
        data: null,
        errors: [{ message: 'INSUFFICIENT_ACCESS' }],
      });
    render(<UpdateRecord />);
    await screen.findByDisplayValue('Acme Corp');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('INSUFFICIENT_ACCESS')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    mockGraphql.mockResolvedValue(LOAD_SUCCESS);
    const { container } = render(<UpdateRecord />);
    await screen.findByDisplayValue('Acme Corp');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
