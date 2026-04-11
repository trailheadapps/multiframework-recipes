/**
 * In LWC Jest the child-to-parent pattern is tested by dispatching a CustomEvent
 * on the child element and asserting the parent reacts. Here there is no custom
 * event — the child calls an onSelect prop (a plain callback). The test interacts
 * with the real DOM element (the <select>) via userEvent rather than dispatching
 * a synthetic event directly: this exercises the full event-handler path.
 */
import { render, screen } from '@testing-library/react';
import { type Mock } from 'vitest';
import userEvent from '@testing-library/user-event';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import ChildToParent from './ChildToParent';

vi.mock('@salesforce/sdk-data', () => ({
  createDataSDK: vi.fn(),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const accountsResponse = (names: string[]) => ({
  data: {
    uiapi: {
      query: {
        Account: {
          edges: names.map((name, i) => ({
            node: { Id: `00${i}`, Name: { value: name } },
          })),
        },
      },
    },
  },
  errors: [],
});

describe('ChildToParent', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ graphql: mockGraphql });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('does not fetch on initial render before an industry is selected', () => {
    // In LWC a @wire adapter fires on connectedCallback regardless of user input.
    // Here the useEffect depends on the industry value, so nothing fetches until
    // the user actually picks an option.
    render(<ChildToParent />);
    expect(createDataSDK).not.toHaveBeenCalled();
  });

  it('fetches and displays accounts when an industry is selected', async () => {
    const user = userEvent.setup();
    mockGraphql.mockResolvedValue(
      accountsResponse(['Tech Corp', 'Startup Inc'])
    );
    render(<ChildToParent />);

    // userEvent.selectOptions() simulates a real browser interaction.
    // LWC equivalent: el.shadowRoot.querySelector('select').value = 'Technology';
    //                 el.shadowRoot.querySelector('select').dispatchEvent(new Event('change'));
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Pick an Industry' }),
      'Technology'
    );

    expect(await screen.findByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('Startup Inc')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = render(<ChildToParent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

});
