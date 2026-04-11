/**
 * Dashboard with Aliased Queries
 *
 * Fetches Accounts, Contacts, and Opportunities in a single GraphQL
 * request using aliases. Transforms the results into stat cards that
 * form a simple dashboard layout.
 *
 * Key Concepts:
 * - Combining aliased multi-object queries for dashboard patterns
 * - Three aliases in one request reduces network round-trips
 * - Layout composition with reusable StatCard components
 * - Data transformation from GraphQL edges to display values
 *
 * Demonstrates: combining aliased multi-object queries with layout
 * composition and data transformation helpers.
 *
 * LWC equivalent: multiple @wire calls or an Apex method returning
 * a wrapper object with counts for each object type.
 */
import { useEffect, useState } from 'react';
import { createDataSDK, gql } from '@salesforce/sdk-data';

// Three aliases in one request — each becomes a key in the response
const QUERY = gql`
  query DashboardCounts {
    uiapi {
      query {
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
        opportunities: Opportunity(first: 50) {
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
      opportunities: { edges: Array<{ node: { Id: string } }> };
    };
  };
}

interface DashboardStats {
  accounts: number;
  contacts: number;
  opportunities: number;
}

export default function DashboardAliasedQueries() {
  const [stats, setStats] = useState<DashboardStats>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchStats = async () => {
      const sdk = await createDataSDK();
      const result = await sdk.graphql?.<QueryResponse>(QUERY);

      if (result?.errors?.length) {
        throw new Error(
          result.errors.map((e: { message: string }) => e.message).join('; ')
        );
      }

      const query = result?.data?.uiapi?.query;
      setStats({
        accounts: query?.accounts?.edges?.length ?? 0,
        contacts: query?.contacts?.edges?.length ?? 0,
        opportunities: query?.opportunities?.edges?.length ?? 0,
      });
    };

    fetchStats()
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Request failed');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm">Loading…</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!stats) return null;

  return (
    <div className="flex gap-4 flex-wrap">
      <div className="w-1/3">
        <StatCard label="Accounts" count={stats.accounts} accent="border-l-primary" />
      </div>
      <div className="w-1/3">
        <StatCard label="Contacts" count={stats.contacts} accent="border-l-rose-400" />
      </div>
      <div className="w-1/3">
        <StatCard label="Opportunities" count={stats.opportunities} accent="border-l-amber-400" />
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
