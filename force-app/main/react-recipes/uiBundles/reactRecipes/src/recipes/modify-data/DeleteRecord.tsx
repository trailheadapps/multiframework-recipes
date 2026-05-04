/**
 * Delete a Record
 *
 * Lists Accounts with a delete button per row. Confirming calls the
 * AccountDelete mutation and removes the row from local state.
 *
 * LWC equivalent: deleteRecord() from lightning/uiRecordApi. After
 * deletion, @wire adapters referencing that record auto-update. Here
 * you remove the row from local state manually — no cache invalidation.
 *
 * @see QueryMutationTogether — inline editing with read-then-write cycle
 */
import { useEffect, useState } from 'react';
import { createDataSDK, gql } from '@salesforce/sdk-data';
import { Button } from '@/components/ui/button';

// ── Read: load Accounts to display ───────────────────────────────────────────
const LIST_QUERY = gql`
  query AccountsForDelete {
    uiapi {
      query {
        Account(first: 10, orderBy: { Name: { order: ASC } }) {
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

interface ListResponse {
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

interface Account {
  Id: string;
  Name: { value: string | null };
  Industry: { value: string | null };
}

// ── Write: delete an Account by Id ───────────────────────────────────────────
// Note: the input type is RecordDeleteInput (generic), not AccountDeleteInput
const DELETE_MUTATION = gql`
  mutation DeleteAccount($input: RecordDeleteInput!) {
    uiapi {
      AccountDelete(input: $input) {
        Id
      }
    }
  }
`;

interface DeleteResponse {
  uiapi: {
    AccountDelete: { Id: string } | null;
  };
}

export default function DeleteRecord() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  // Which row is showing the "Are you sure?" confirmation buttons
  const [confirmId, setConfirmId] = useState<string>();
  // Which row is currently being deleted (shows a spinner/disabled state)
  const [deletingId, setDeletingId] = useState<string>();

  useEffect(() => {
    (async () => {
      try {
        const sdk = await createDataSDK();
        const res = await sdk.graphql?.<ListResponse>({ query: LIST_QUERY });
        if (res?.errors?.length) {
          throw new Error(res.errors.map((e: { message: string }) => e.message).join('; '));
        }
        const nodes = (res?.data.uiapi?.query?.Account?.edges ?? [])
          .map(edge => edge?.node)
          .filter((n): n is Account => n != null);
        setAccounts(nodes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Request failed');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleDelete(id: string) {
    setConfirmId(undefined);
    setDeletingId(id);

    try {
      const sdk = await createDataSDK();
      const res = await sdk.graphql?.<DeleteResponse>({
        query: DELETE_MUTATION,
        variables: { input: { Id: id } },
      });
      if (res?.errors?.length) {
        throw new Error(res.errors.map((e: { message: string }) => e.message).join('; '));
      }
      // Remove the deleted row from local state — no re-fetch needed
      setAccounts(prev => prev.filter(a => a.Id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setDeletingId(undefined);
    }
  }

  if (loading) return <p className="text-sm">Loading…</p>;

  if (error) return <p className="text-xs text-destructive">{error}</p>;

  if (accounts.length === 0)
    return (
      <p className="text-muted-foreground">
        No accounts. (Reload if you deleted all rows.)
      </p>
    );

  return (
    <table
      className="w-full text-sm [&_th]:border-b [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium [&_td]:border-b [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-accent/50"
      style={{ width: '100%' }}
    >
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Industry</th>
          <th scope="col" style={{ width: '13rem' }}></th>
        </tr>
      </thead>
      <tbody>
        {accounts.map(account => (
          <tr key={account.Id}>
            <td>{account.Name?.value}</td>
            <td className="text-muted-foreground">
              {account.Industry?.value ?? '—'}
            </td>
            <td style={{ textAlign: 'right' }}>
              {deletingId === account.Id ? (
                <span className="text-muted-foreground text-xs">Deleting…</span>
              ) : confirmId === account.Id ? (
                <span className="flex gap-2 justify-end">
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(account.Id)}
                    disabled={deletingId !== undefined}
                  >
                    Yes, Delete
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setConfirmId(undefined)}
                  >
                    Cancel
                  </Button>
                </span>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setConfirmId(account.Id)}
                  disabled={deletingId !== undefined}
                >
                  Delete
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
