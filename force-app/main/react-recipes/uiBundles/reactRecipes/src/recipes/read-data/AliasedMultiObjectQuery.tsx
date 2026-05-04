/**
 * Aliased Multi-Object Query
 *
 * Queries Accounts and Contacts in a single GraphQL request using aliases.
 * In LWC you'd need two @wire calls or an Apex method to fetch two objects;
 * here aliases let you combine them into one round-trip.
 *
 * Key Concepts:
 * - GraphQL aliases (accounts: Account, contacts: Contact) to query
 *   multiple objects in a single request
 * - Each alias becomes its own key in the response data
 * - Reduces network round-trips compared to separate queries
 *
 * LWC equivalent: two separate @wire(getListUi) calls or a single
 * Apex method returning a wrapper with both datasets.
 *
 * @see ImperativeRefetch — re-fetching data on demand
 */
import { useEffect, useState } from 'react';
import { createDataSDK, gql } from '@salesforce/sdk-data';

// Aliases (accounts: Account, contacts: Contact) let us query two objects
// in one round-trip. Each alias becomes a key in the response data.
const QUERY = gql`
  query MultiObjectCounts {
    uiapi {
      query {
        # UIAPI has no COUNT() aggregate — edges.length is the workaround.
        # Results are capped at first: 50, so counts above that will be undercounted.
        accounts: Account(first: 50) {
          edges {
            node {
              Id
            }
          }
        }
        contacts: Contact(first: 50) {
          edges {
            node {
              Id
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
      accounts: { edges: Array<{ node: { Id: string } }> };
      contacts: { edges: Array<{ node: { Id: string } }> };
    };
  };
}

interface Counts {
  accounts: number;
  contacts: number;
}

export default function AliasedMultiObjectQuery() {
  const [counts, setCounts] = useState<Counts>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchCounts = async () => {
      const sdk = await createDataSDK();
      const result = await sdk.graphql?.<QueryResponse>({ query: QUERY });

      if (result?.errors?.length) {
        throw new Error(
          result.errors.map((e: { message: string }) => e.message).join('; ')
        );
      }

      const query = result?.data?.uiapi?.query;
      setCounts({
        // Each alias returns its own connection — count the edges
        accounts: query?.accounts?.edges?.length ?? 0,
        contacts: query?.contacts?.edges?.length ?? 0,
      });
    };

    fetchCounts()
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Request failed');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm">Loading…</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!counts) return null;

  return (
    <div className="flex gap-4">
      <div className="w-1/2">
        <StatCard label="Accounts" count={counts.accounts} accent="border-l-primary" />
      </div>
      <div className="w-1/2">
        <StatCard label="Contacts" count={counts.contacts} accent="border-l-violet-400" />
      </div>
    </div>
  );
}

function StatCard({ label, count, accent }: { label: string; count: number; accent: string }) {
  return (
    <div className={`rounded-md border border-border bg-card p-4 text-center shadow-sm border-l-4 ${accent}`}>
      <p className="text-2xl font-bold tabular-nums">{count}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
