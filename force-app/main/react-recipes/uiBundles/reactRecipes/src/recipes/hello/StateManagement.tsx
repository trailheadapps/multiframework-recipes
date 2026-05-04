/**
 * State Management (Lifting State Up)
 *
 * Two sibling components share a selected Account by lifting state to their
 * common parent. The parent fetches Accounts, one sibling selects, the other
 * displays.
 *
 * LWC equivalent: sibling communication uses Lightning Message Service (LMS)
 * or a shared pub/sub module. In React, the idiomatic answer is lifting state
 * to the nearest common ancestor. useState here plays the role of @track
 * (reactive properties).
 *
 * @see LifecycleFetch — cleanup patterns for async effects
 */
import { useEffect, useState } from 'react';
import { createDataSDK, gql } from '@salesforce/sdk-data';
import { Button } from '@/components/ui/button';

const QUERY = gql`
  query AccountsForSelection {
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

export default function StateManagement() {
  const [accounts, setAccounts] = useState<AccountFields[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
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
  if (accounts.length === 0) return <p className="text-sm">Loading…</p>;

  const selected = accounts.find(a => a.id === selectedId);

  return (
    <div className="flex gap-4">
      {/* Sibling 1: selects an Account */}
      <div className="w-1/2">
        <AccountSelector
          accounts={accounts}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>
      {/* Sibling 2: displays the selection */}
      <div className="w-1/2">
        <AccountDetail account={selected} />
      </div>
    </div>
  );
}

interface AccountSelectorProps {
  accounts: AccountFields[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}

function AccountSelector({
  accounts,
  selectedId,
  onSelect,
}: AccountSelectorProps) {
  return (
    <ul>
      {accounts.map(account => (
        <li key={account.id} className="py-1">
          <Button
            variant={account.id === selectedId ? 'default' : 'outline'}
            className="w-full"
            onClick={() => onSelect(account.id)}
          >
            {account.name}
          </Button>
        </li>
      ))}
    </ul>
  );
}

interface AccountDetailProps {
  account: AccountFields | undefined;
}

function AccountDetail({ account }: AccountDetailProps) {
  if (!account) {
    return (
      <div className="rounded-md border border-dashed border-border bg-card/50 p-6 text-center">
        <p className="text-muted-foreground">Select an account</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card p-4">
      <p className="text-lg font-semibold">{account.name}</p>
      <p className="text-xs text-muted-foreground mt-0.5">
        {account.industry ?? 'No Industry'}
      </p>
    </div>
  );
}
