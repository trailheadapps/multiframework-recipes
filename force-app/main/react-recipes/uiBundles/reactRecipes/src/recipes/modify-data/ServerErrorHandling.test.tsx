// GraphQL errors live in result.errors[], not as thrown exceptions. In LWC
// you'd inspect the error property of a wire result or the error parameter of
// an Apex callback. Here the component explicitly checks result.errors after
// every graphql() call — a network failure (thrown) and a field-validation
// failure (result.errors) both surface through the same error state.
import { render, screen } from '@testing-library/react';
import { type Mock } from 'vitest';
import userEvent from '@testing-library/user-event';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import ServerErrorHandling from './ServerErrorHandling';

vi.mock('@salesforce/sdk-data', () => ({
  createDataSDK: vi.fn(),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}));

describe('ServerErrorHandling', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ graphql: mockGraphql });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('displays result.errors[] as an error alert — not a thrown exception', async () => {
    // This is the key pattern: UIAPI field-validation errors come back in
    // result.errors[], not as a network exception. The component handles them
    // by reading the array, not by catching a thrown error.
    const user = userEvent.setup();
    mockGraphql.mockResolvedValue({
      data: null,
      errors: [{ message: 'REQUIRED_FIELD_MISSING: Last Name' }],
    });
    render(<ServerErrorHandling />);

    await user.click(screen.getByRole('button'));

    // role="alert" announces the error to screen readers immediately
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByText(/REQUIRED_FIELD_MISSING: Last Name/)
    ).toBeInTheDocument();
  });

  it('concatenates multiple errors with a semicolon', async () => {
    const user = userEvent.setup();
    mockGraphql.mockResolvedValue({
      data: null,
      errors: [
        { message: 'REQUIRED_FIELD_MISSING: Last Name' },
        { message: 'INVALID_EMAIL_ADDRESS' },
      ],
    });
    render(<ServerErrorHandling />);

    await user.click(screen.getByRole('button'));

    await screen.findByRole('alert');
    expect(
      screen.getByText(/REQUIRED_FIELD_MISSING.*INVALID_EMAIL_ADDRESS/)
    ).toBeInTheDocument();
  });

  it('displays a network-level thrown error through the same error state', async () => {
    // A thrown exception (network failure, SDK error) follows the same
    // display path as a result.errors[] entry — both surface in role="alert".
    const user = userEvent.setup();
    mockGraphql.mockRejectedValue(new Error('Network request failed'));
    render(<ServerErrorHandling />);

    await user.click(screen.getByRole('button'));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Network request failed')).toBeInTheDocument();
  });

  it('shows a success toast with the created contact ID when no errors occur', async () => {
    const user = userEvent.setup();
    mockGraphql.mockResolvedValue({
      data: {
        uiapi: {
          ContactCreate: { Record: { Id: '003ABC', Name: { value: 'J. Doe' } } },
        },
      },
      errors: [],
    });
    render(<ServerErrorHandling />);

    await user.click(screen.getByRole('button'));

    expect(await screen.findByRole('status')).toBeInTheDocument();
    expect(screen.getByText('003ABC')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = render(<ServerErrorHandling />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
