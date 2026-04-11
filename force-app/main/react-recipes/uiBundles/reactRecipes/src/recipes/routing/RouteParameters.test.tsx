// Route parameter tests inject a real :accountId into useParams() by setting up
// a MemoryRouter with a matching Route. In LWC you'd mock CurrentPageReference
// via registerTestWireAdapter and emit { state: { recordId } }; here the URL
// itself is the source of truth and no wire adapter registration is needed.
import { render, screen } from '@testing-library/react';
import { type Mock } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import {
  RouteParametersList,
  RouteParametersDetail,
} from './RouteParameters';

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

const DETAIL_SUCCESS = {
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
                Phone: { value: '555-1234' },
                Website: { value: 'https://acme.example.com' },
              },
            },
          ],
        },
      },
    },
  },
  errors: [],
};

describe('RouteParametersList', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ graphql: mockGraphql });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function renderList() {
    // RouteParametersList uses <Link> but not useParams, so a bare MemoryRouter
    // is enough — no Routes/Route wrapper required.
    return render(
      <MemoryRouter initialEntries={['/route-parameters']}>
        <RouteParametersList />
      </MemoryRouter>
    );
  }

  it('renders a link for each account after data loads', async () => {
    mockGraphql.mockResolvedValue(LIST_SUCCESS);
    renderList();
    expect(
      await screen.findByRole('link', { name: 'Acme Corp' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Globex' })).toBeInTheDocument();
  });

  it('links point to /route-parameters/:accountId', async () => {
    mockGraphql.mockResolvedValue(LIST_SUCCESS);
    renderList();
    // Assert the href the way you'd assert a NavigationMixin page reference —
    // except here it's just a string attribute on a plain <a> element.
    expect(
      await screen.findByRole('link', { name: 'Acme Corp' })
    ).toHaveAttribute('href', '/route-parameters/001');
  });

  it('is accessible', async () => {
    mockGraphql.mockResolvedValue(LIST_SUCCESS);
    const { container } = renderList();
    await screen.findByText('Acme Corp');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

});

describe('RouteParametersDetail', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ graphql: mockGraphql });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Wrap in a Route with the :accountId segment so useParams() returns the
  // right value. This is the React equivalent of emitting a CurrentPageReference
  // with { attributes: { recordId: '001' } } via a wire adapter mock.
  function renderDetail(accountId: string) {
    return render(
      <MemoryRouter initialEntries={[`/route-parameters/${accountId}`]}>
        <Routes>
          <Route
            path="/route-parameters/:accountId"
            element={<RouteParametersDetail />}
          />
        </Routes>
      </MemoryRouter>
    );
  }

  it('renders the account name after data loads', async () => {
    mockGraphql.mockResolvedValue(DETAIL_SUCCESS);
    renderDetail('001');
    expect(await screen.findByText('Acme Corp')).toBeInTheDocument();
  });

  it('passes the accountId from the URL as a GraphQL query variable', async () => {
    mockGraphql.mockResolvedValue(DETAIL_SUCCESS);
    renderDetail('001');
    await screen.findByText('Acme Corp');
    // Verify the route param was forwarded to the query — the equivalent of
    // confirming @wire(getRecord, { recordId: '$recordId' }) received the right id.
    expect(mockGraphql).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ id: '001' })
    );
  });

  it('renders a back link pointing to /routing', async () => {
    mockGraphql.mockResolvedValue(DETAIL_SUCCESS);
    renderDetail('001');
    await screen.findByText('Acme Corp');
    expect(
      screen.getByRole('link', { name: /back to list/i })
    ).toHaveAttribute('href', '/routing');
  });

});
