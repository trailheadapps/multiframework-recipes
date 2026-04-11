// Nested route tests wire up the real route hierarchy so <Outlet> and
// useOutletContext() work without mocking any hooks. In LWC there is no
// equivalent pattern — data sharing between a layout route and its child
// routes via outlet context has no LWC counterpart.
//
// For NestedRoutesDetail in isolation, a minimal TestLayout provides
// <Outlet context={...}> directly, the same way the real NestedRoutes
// layout does, without going through the data-fetching layer.
import { render, screen } from '@testing-library/react';
import { type Mock } from 'vitest';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router';
import { createDataSDK } from '@salesforce/sdk-data';
import { axe } from 'vitest-axe';
import NestedRoutes, {
  NestedRoutesIndex,
  NestedRoutesDetail,
} from './NestedRoutes';

vi.mock('@salesforce/sdk-data', () => ({
  createDataSDK: vi.fn(),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const ACCOUNTS = [
  { id: '001', name: 'Acme Corp', industry: 'Technology' },
  { id: '002', name: 'Globex', industry: null },
];

const ACCOUNTS_SUCCESS = {
  data: {
    uiapi: {
      query: {
        Account: {
          edges: ACCOUNTS.map(a => ({
            node: {
              Id: a.id,
              Name: { value: a.name },
              Industry: { value: a.industry },
            },
          })),
        },
      },
    },
  },
  errors: [],
};

describe('NestedRoutes (layout)', () => {
  const mockGraphql = vi.fn();

  beforeEach(() => {
    (createDataSDK as Mock).mockResolvedValue({ graphql: mockGraphql });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Render the full route hierarchy so <Outlet />, useParams(), and
  // useOutletContext() all receive real values from the router.
  function renderLayout(path = '/nested') {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/nested" element={<NestedRoutes />}>
            <Route index element={<NestedRoutesIndex />} />
            <Route path=":accountId" element={<NestedRoutesDetail />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  }

  it('renders account links in the sidebar after data loads', async () => {
    mockGraphql.mockResolvedValue(ACCOUNTS_SUCCESS);
    renderLayout();
    expect(
      await screen.findByRole('link', { name: 'Acme Corp' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Globex' })).toBeInTheDocument();
  });

  it('shows the index prompt when no account is selected', async () => {
    mockGraphql.mockResolvedValue(ACCOUNTS_SUCCESS);
    renderLayout();
    // The index route renders in the <Outlet /> when the path is exactly /nested.
    expect(
      await screen.findByText('Select an account from the list')
    ).toBeInTheDocument();
  });

  it('renders the detail panel alongside the sidebar when an account route is active', async () => {
    mockGraphql.mockResolvedValue(ACCOUNTS_SUCCESS);
    // Navigate directly to a detail route — the sidebar stays mounted.
    renderLayout('/nested/001');
    expect(await screen.findByRole('link', { name: 'Acme Corp' })).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    mockGraphql.mockResolvedValue(ACCOUNTS_SUCCESS);
    const { container } = renderLayout();
    await screen.findByText('Acme Corp');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

});

describe('NestedRoutesDetail', () => {
  // Provide outlet context by using a minimal TestLayout — this avoids going
  // through the data-fetching layer and tests the detail component in isolation.
  // The accounts array is passed via <Outlet context={...}> exactly as the real
  // NestedRoutes layout does.
  function renderDetail(accountId: string) {
    const TestLayout = () => <Outlet context={{ accounts: ACCOUNTS }} />;
    return render(
      <MemoryRouter initialEntries={[`/nested/${accountId}`]}>
        <Routes>
          <Route path="/nested" element={<TestLayout />}>
            <Route path=":accountId" element={<NestedRoutesDetail />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  }

  it('renders the account name and industry from outlet context', () => {
    renderDetail('001');
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('shows "No Industry" when industry is null', () => {
    renderDetail('002');
    expect(screen.getByText('Globex')).toBeInTheDocument();
    expect(screen.getByText('No Industry')).toBeInTheDocument();
  });

  it('renders "Not found." when the accountId does not match any account', () => {
    renderDetail('999');
    expect(screen.getByText('Not found.')).toBeInTheDocument();
  });
});

describe('NestedRoutesIndex', () => {
  it('renders the prompt to select an account', () => {
    render(
      <MemoryRouter>
        <NestedRoutesIndex />
      </MemoryRouter>
    );
    expect(
      screen.getByText('Select an account from the list')
    ).toBeInTheDocument();
  });
});
