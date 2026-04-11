/**
 * Parent-to-Child (Props) with Salesforce Data
 *
 * The parent fetches Accounts via GraphQL and passes each one to a child
 * component as props. The child is a pure display component.
 *
 * LWC equivalent: child components receive data via @api properties set
 * by the parent in the template. React uses props — the same concept,
 * different syntax.
 *
 * @see ChildToParent — communicating from child back to parent via callbacks
 */
import { useEffect, useState } from 'react';
import { createDataSDK, gql } from '@salesforce/sdk-data';

const QUERY = gql`
  query TwoAccounts {
    uiapi {
      query {
        Account(first: 2, orderBy: { Name: { order: ASC } }) {
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

export default function ParentToChild() {
  const [accounts, setAccounts] = useState<AccountFields[]>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchAccounts = async () => {
      const sdk = await createDataSDK();
      const result = await sdk.graphql?.<QueryResponse>(QUERY);

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
    <div className="flex gap-4">
      {/* Each Account is passed to a child via props — not fetched again */}
      {accounts.map(account => (
        <div key={account.id}>
          <AccountCard name={account.name} industry={account.industry} />
        </div>
      ))}
    </div>
  );
}

interface AccountCardProps {
  name: string;
  industry: string | null;
}

function AccountCard({ name, industry }: AccountCardProps) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <p className="text-sm font-medium">
        <strong>{name}</strong>
      </p>
      <p className="text-xs text-muted-foreground">
        {industry ?? 'No Industry'}
      </p>
    </div>
  );
}
