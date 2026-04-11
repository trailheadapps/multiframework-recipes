/**
 * Searchable Account List
 *
 * A controlled search input drives a GraphQL variable that filters
 * Accounts by name. A debounce timer prevents firing a query on every
 * keystroke — the query only runs after the user stops typing.
 *
 * Key Concepts:
 * - Debounced search: wait for the user to stop typing before querying
 * - Combining query variables with user input via the `like` operator
 * - Controlled input bound to search state
 *
 * Demonstrates: combining variables, imperative refetch, loading states,
 * and debounce in a single cohesive pattern.
 *
 * LWC equivalent: a @track property with a debounce timer passed to @wire
 * with the graphql adapter. The wire re-fires when the variable changes.
 *
 * @see DashboardAliasedQueries — combining aliased queries for dashboards
 */
import { useEffect, useState, useRef, useCallback } from 'react';
import { createDataSDK, gql } from '@salesforce/sdk-data';
import { Input } from '@/components/ui/input';

// The $name variable drives the `like` filter. Passing "%%" matches all.
const QUERY = gql`
  query SearchAccounts($name: String = "%%") {
    uiapi {
      query {
        Account(
          first: 10
          where: { Name: { like: $name } }
          orderBy: { Name: { order: ASC } }
        ) {
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

export default function SearchableAccountList() {
  const [search, setSearch] = useState('');
  const [accounts, setAccounts] = useState<AccountFields[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchAccounts = useCallback(async (term: string) => {
    setLoading(true);
    setError(undefined);

    try {
      const sdk = await createDataSDK();
      // Wrap the search term in wildcards for the `like` operator
      const result = await sdk.graphql?.<QueryResponse>(QUERY, {
        name: term ? `%${term}%` : '%%',
      });

      if (result?.errors?.length) {
        throw new Error(
          result.errors.map((e: { message: string }) => e.message).join('; ')
        );
      }

      const edges = result?.data?.uiapi?.query?.Account?.edges ?? [];
      setAccounts(
        edges
          .map(edge => edge?.node)
          .filter(Boolean)
          .map(node => ({
            id: node.Id,
            name: node.Name?.value ?? 'Unknown',
            industry: node.Industry?.value ?? null,
          }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all accounts on mount
  useEffect(() => {
    fetchAccounts('');
  }, [fetchAccounts]);

  // Debounce: wait 350ms after the user stops typing before querying
  function handleSearchChange(value: string) {
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchAccounts(value);
    }, 350);
  }

  return (
    <div>
      <div className="space-y-1 mb-2">
        <Input
          type="text"
          placeholder="Search accounts by name…"
          value={search}
          onChange={e => handleSearchChange(e.target.value)}
        />
      </div>

      {error && <p className="text-destructive">{error}</p>}

      {loading && <p className="text-sm text-muted-foreground">Searching…</p>}

      {!loading && !error && accounts.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No accounts match &ldquo;{search}&rdquo;
        </p>
      )}

      {!loading && !error && accounts.length > 0 && (
        <div className="rounded-md border border-border bg-card p-4 shadow-sm">
          <ul>
            {accounts.map(account => (
              <li
                key={account.id}
                className="py-2 -mx-2 px-2 rounded-md transition-colors hover:bg-accent/50"
              >
                <p className="text-sm text-foreground">{account.name}</p>
                {account.industry && (
                  <p className="text-xs text-muted-foreground">
                    {account.industry}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
