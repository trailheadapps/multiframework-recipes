/**
 * UIAPI GraphQL surfaces query-level errors in result.errors[] rather than
 * throwing — a pattern that differs from typical REST error handling. The
 * component also catches thrown exceptions (network failures, SDK errors) as
 * a second error layer. Tests mock createDataSDK → graphql to return errors
 * arrays, empty results, or rejected promises to cover both layers. We also
 * verify that previous results are cleared when a new query is run.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type Mock } from 'vitest';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import GraphqlErrors from './GraphqlErrors';

vi.mock('@salesforce/sdk-data', () => ({
  createDataSDK: vi.fn(),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}));

describe('GraphqlErrors', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ graphql: mockGraphql });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows errors returned by a bad query', async () => {
    const user = userEvent.setup();
    mockGraphql.mockResolvedValue({
      errors: [
        { message: 'Field not found: NonExistentField__c', path: ['uiapi', 'query', 'Account'] },
      ],
    });

    render(<GraphqlErrors />);
    await user.click(screen.getByRole('button', { name: 'Run Bad Query' }));

    expect(
      await screen.findByText('1 error returned')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Field not found: NonExistentField__c')
    ).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('displays the error path when provided', async () => {
    const user = userEvent.setup();
    mockGraphql.mockResolvedValue({
      errors: [
        { message: 'Bad field', path: ['uiapi', 'query'] },
      ],
    });

    render(<GraphqlErrors />);
    await user.click(screen.getByRole('button', { name: 'Run Bad Query' }));

    expect(await screen.findByText(/path: uiapi\.query/)).toBeInTheDocument();
  });

  it('shows success message for a good query', async () => {
    const user = userEvent.setup();
    mockGraphql.mockResolvedValue({
      data: { uiapi: { query: { Account: { edges: [] } } } },
      errors: [],
    });

    render(<GraphqlErrors />);
    await user.click(screen.getByRole('button', { name: 'Run Good Query' }));

    expect(
      await screen.findByText('Good query succeeded — no errors.')
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows multiple errors with plural label', async () => {
    const user = userEvent.setup();
    mockGraphql.mockResolvedValue({
      errors: [
        { message: 'Error one' },
        { message: 'Error two' },
      ],
    });

    render(<GraphqlErrors />);
    await user.click(screen.getByRole('button', { name: 'Run Bad Query' }));

    expect(await screen.findByText('2 errors returned')).toBeInTheDocument();
    expect(screen.getByText('Error one')).toBeInTheDocument();
    expect(screen.getByText('Error two')).toBeInTheDocument();
  });

  it('handles thrown exceptions (network failures)', async () => {
    const user = userEvent.setup();
    mockGraphql.mockRejectedValue(new Error('Network timeout'));

    render(<GraphqlErrors />);
    await user.click(screen.getByRole('button', { name: 'Run Bad Query' }));

    expect(
      await screen.findByText('Network timeout')
    ).toBeInTheDocument();
  });

  it('clears previous results when running a new query', async () => {
    const user = userEvent.setup();
    mockGraphql
      .mockResolvedValueOnce({
        errors: [{ message: 'First error' }],
      })
      .mockResolvedValueOnce({
        data: { uiapi: { query: { Account: { edges: [] } } } },
        errors: [],
      });

    render(<GraphqlErrors />);

    await user.click(screen.getByRole('button', { name: 'Run Bad Query' }));
    await screen.findByText('First error');

    await user.click(screen.getByRole('button', { name: 'Run Good Query' }));
    await screen.findByText('Good query succeeded — no errors.');

    expect(screen.queryByText('First error')).not.toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = render(<GraphqlErrors />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
