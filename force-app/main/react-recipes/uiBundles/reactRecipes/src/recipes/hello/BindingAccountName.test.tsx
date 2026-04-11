/**
 * In LWC Jest you mock wire adapters using registerLdsTestWireAdapter() or
 * registerApexTestWireAdapter() from @salesforce/sfdx-lwc-jest. Here there is
 * no wire adapter — createDataSDK is a plain async function, so vi.mock() is
 * all that's needed to replace it with a controllable spy.
 */
import { render, screen } from '@testing-library/react';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import BindingAccountName from './BindingAccountName';

vi.mock('@salesforce/sdk-data', () => ({
  createDataSDK: vi.fn(),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const ACCOUNT_SUCCESS = {
  data: {
    uiapi: {
      query: {
        Account: {
          edges: [{ node: { Id: '001', Name: { value: 'Acme Corp' } } }],
        },
      },
    },
  },
  errors: [],
};

describe('BindingAccountName', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ graphql: mockGraphql });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the account name after data loads', async () => {
    mockGraphql.mockResolvedValue(ACCOUNT_SUCCESS);
    render(<BindingAccountName />);
    // findByText() polls until the element appears — no flushPromises() needed.
    // LWC equivalent: adapter.emit(data); await Promise.resolve(); el.shadowRoot.querySelector(...)
    expect(await screen.findByText('Acme Corp')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    mockGraphql.mockResolvedValue(ACCOUNT_SUCCESS);
    const { container } = render(<BindingAccountName />);
    await screen.findByText('Acme Corp');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

});
