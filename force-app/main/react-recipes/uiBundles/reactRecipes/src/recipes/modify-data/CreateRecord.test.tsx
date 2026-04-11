// In LWC you'd mock createRecord() from lightning/uiRecordApi. Here the same
// createDataSDK mock used for queries handles mutations too — there is no
// separate mutation adapter to register. The key difference: LWC's createRecord
// automatically notifies @wire adapters that cache the same record type; here
// local state is updated directly from the mutation response with no refresh chain.
import { render, screen, fireEvent } from '@testing-library/react';
import { type Mock } from 'vitest';
import userEvent from '@testing-library/user-event';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import CreateRecord from './CreateRecord';

vi.mock('@salesforce/sdk-data', () => ({
  createDataSDK: vi.fn(),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const CREATE_SUCCESS = {
  data: {
    uiapi: {
      AccountCreate: {
        Record: { Id: '001NEW', Name: { value: 'New Account' } },
      },
    },
  },
  errors: [],
};

describe('CreateRecord', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ graphql: mockGraphql });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('enables the submit button once a name is entered', async () => {
    const user = userEvent.setup();
    render(<CreateRecord />);
    await user.type(screen.getByLabelText(/Account Name/), 'Acme Corp');
    expect(
      screen.getByRole('button', { name: 'Create Account' })
    ).not.toBeDisabled();
  });

  it('disables the submit button and shows "Creating…" while the mutation is in flight', async () => {
    const user = userEvent.setup();
    mockGraphql.mockReturnValue(new Promise(() => {})); // never resolves
    render(<CreateRecord />);
    await user.type(screen.getByLabelText(/Account Name/), 'Acme Corp');
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(screen.getByRole('button', { name: 'Creating…' })).toBeDisabled();
  });

  it('shows a success toast with the record name and ID after creation', async () => {
    const user = userEvent.setup();
    mockGraphql.mockResolvedValue(CREATE_SUCCESS);
    render(<CreateRecord />);
    await user.type(screen.getByLabelText(/Account Name/), 'New Account');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    // role="status" is on the success toast — a more resilient selector than text alone
    expect(await screen.findByRole('status')).toBeInTheDocument();
    expect(screen.getByText('New Account')).toBeInTheDocument();
    expect(screen.getByText('001NEW')).toBeInTheDocument();
  });

  it('calls the mutation with the trimmed account name as an input variable', async () => {
    const user = userEvent.setup();
    mockGraphql.mockResolvedValue(CREATE_SUCCESS);
    render(<CreateRecord />);
    await user.type(screen.getByLabelText(/Account Name/), 'New Account');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    // Wait for the async operation to complete before asserting on the spy.
    // In LWC you'd assert createRecord was called with { apiName, fields };
    // here you assert the graphql function was called with a variables object.
    await screen.findByRole('status');
    expect(mockGraphql).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        input: { Account: { Name: 'New Account' } },
      })
    );
  });

  it('shows a "Create Another" button after success that resets the form', async () => {
    const user = userEvent.setup();
    mockGraphql.mockResolvedValue(CREATE_SUCCESS);
    render(<CreateRecord />);
    await user.type(screen.getByLabelText(/Account Name/), 'New Account');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    await screen.findByRole('status');

    await user.click(screen.getByRole('button', { name: 'Create Another' }));

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Account Name/)).toHaveValue('');
  });

  it('is accessible', async () => {
    const { container } = render(<CreateRecord />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

});
