/**
 * Nested Routes (Master-Detail)
 *
 * A master-detail layout where the sidebar stays visible while a detail panel
 * renders alongside it via <Outlet />. The default export is the layout route;
 * NestedRoutesIndex and NestedRoutesDetail are the child routes registered in
 * routes.tsx. Account data is shared with children via useOutletContext.
 *
 * LWC equivalent: no direct equivalent — LWC apps typically use separate
 * components wired together via Lightning App Builder. React Router's
 * nested routes and <Outlet /> provide a declarative master-detail pattern.
 *
 * Click an Account in the sidebar — the detail panel loads alongside
 * it without the sidebar unmounting.
 *
 * @see routes.tsx — the route tree that wires NestedRoutes, NestedRoutesIndex, and NestedRoutesDetail together
 * @see UseNavigate — programmatic navigation after actions
 */
import { useEffect, useState } from 'react';
import { Link, Outlet, useOutletContext, useParams } from 'react-router';
import { createDataSDK, gql } from '@salesforce/sdk-data';

const QUERY = gql`
  query AccountsForNesting {
    uiapi {
      query {
        Account(first: 5, orderBy: { Name: { order: ASC } }) {
          edges {
            node {
              Id
              Name @optional {
                value
              }
              Industry @optional {
                value
              }
            }
          }
        }
      }
    }
  }
`;

interface QueryResponse {
  uiapi: {
    query: {
      Account: {
        edges: Array<{
          node: {
            Id: string;
            Name: { value: string | null };
            Industry: { value: string | null };
          };
        }>;
      };
    };
  };
}

interface AccountFields {
  id: string;
  name: string;
  industry: string | null;
}

export default function NestedRoutes() {
  const [accounts, setAccounts] = useState<AccountFields[]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchAccounts = async () => {
      const sdk = await createDataSDK();
      const result = await sdk.graphql?.<QueryResponse>({ query: QUERY });

      if (result?.errors?.length) {
        throw new Error(
          result.errors.map((e: { message: string }) => e.message).join('; ')
        );
      }

      const edges = result?.data?.uiapi?.query?.Account?.edges ?? [];
      setAccounts(
        edges
          .map(edge => edge?.node)
          .filter(Boolean) // edges can contain null nodes in UIAPI — filter before mapping
          .map(node => ({
            id: node.Id,
            name: node.Name?.value ?? 'Unknown',
            industry: node.Industry?.value ?? null,
          }))
      );
    };

    fetchAccounts().catch(err => {
      setError(err instanceof Error ? err.message : 'Request failed');
    });
  }, []);

  if (error) return <p className="text-destructive">{error}</p>;
  if (!accounts.length)
    return <p className="text-sm">Loading…</p>;

  return <MasterDetailLayout accounts={accounts} />;
}

function MasterDetailLayout({ accounts }: { accounts: AccountFields[] }) {
  return (
    <div className="flex min-h-40">
      {/* Sidebar */}
      <div
        className="w-2/5 border-r border-border pr-3"
      >
        <ul className="divide-y">
          {accounts.map(account => (
            <li key={account.id} className="py-2">
              {/* Relative path (no leading slash) — appends to the current route */}
              <Link
                to={account.id}
                className="text-sm text-primary hover:underline"
              >
                {account.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {/* Detail panel — NestedRoutesIndex or NestedRoutesDetail renders here
           depending on the URL. See routes.tsx for the child route config. */}
      <div className="pl-3">
        <Outlet context={{ accounts }} />
      </div>
    </div>
  );
}

/** Index route — shown when no account is selected */
export function NestedRoutesIndex() {
  return (
    <div className="text-center p-4">
      <p className="text-muted-foreground">Select an account from the list</p>
    </div>
  );
}

/** Detail route — reads :accountId from the URL, accounts from outlet context */
export function NestedRoutesDetail() {
  const { accountId } = useParams();
  // accounts are passed from the layout route — no need to re-fetch in the child
  const { accounts } = useOutletContext<{ accounts: AccountFields[] }>();
  const account = accounts.find(a => a.id === accountId);

  if (!account) return <p className="text-muted-foreground">Not found.</p>;

  return (
    <div className="rounded-md bg-muted p-4">
      <p className="text-lg font-semibold">{account.name}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {account.industry ?? 'No Industry'}
      </p>
    </div>
  );
}
