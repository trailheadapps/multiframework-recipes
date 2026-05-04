/**
 * List Rendering with Salesforce Records
 *
 * Fetches Accounts via UIAPI GraphQL and renders them using .map().
 * Each item needs a stable key prop; here we use the record Id.
 *
 * LWC equivalent: list rendering uses for:each / lwc:for directives on
 * template elements with a key attribute. React uses .map() in JSX with
 * a key prop.
 *
 * @see ParentToChild — passing data from parent to child components via props
 */
import { useEffect, useState } from 'react';
import { createDataSDK, gql } from '@salesforce/sdk-data';

const QUERY = gql`
  query AccountList {
    uiapi {
      query {
        Account(first: 6, orderBy: { Name: { order: ASC } }) {
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

export default function ListOfAccounts() {
  const [accounts, setAccounts] = useState<AccountFields[]>();
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
          .filter(Boolean)
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
  if (!accounts) return <p className="text-sm">Loading…</p>;

  return (
    <ul>
      {/* .map() replaces LWC's for:each directive. The key must be stable — record Id is ideal. */}
      {accounts.map(account => (
        <li
          key={account.id}
          className="py-2 -mx-2 px-2 rounded-md transition-colors hover:bg-accent/50"
        >
          <p className="text-sm">{account.name}</p>
          {account.industry && (
            <p className="text-xs text-muted-foreground">{account.industry}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
