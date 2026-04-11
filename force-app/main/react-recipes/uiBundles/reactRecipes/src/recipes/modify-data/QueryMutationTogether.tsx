/**
 * Query + Mutation Together
 *
 * Lists Accounts with inline editing. Clicking Edit opens an inline form;
 * saving calls AccountUpdate and patches that row in local state.
 *
 * Key Concepts:
 * - Read-then-edit-then-write cycle: query populates a list, inline form
 *   edits one row, mutation saves it, and the server response patches
 *   local state without a full re-fetch
 * - Optimistic-style UI update from the mutation response
 *
 * LWC equivalent: @wire populates the list, updateRecord() saves changes,
 * and @wire auto-refreshes. Here local state must be synced manually.
 *
 * @see ServerErrorHandling — handling mutation errors from the server
 */
import { useEffect, useState, type FormEvent } from 'react';
import { createDataSDK, gql } from '@salesforce/sdk-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ── Read: load Accounts ──────────────────────────────────────────────────────
const LIST_QUERY = gql`
  query AccountsForEditing {
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

// ── Write: update Name and Industry ──────────────────────────────────────────
const UPDATE_MUTATION = gql`
  mutation UpdateAccount($input: AccountUpdateInput!) {
    uiapi {
      AccountUpdate(input: $input) {
        Record {
          Id
          Name {
            value
          }
          Industry {
            value
          }
        }
      }
    }
  }
`;

interface UpdateResponse {
  uiapi: {
    AccountUpdate: {
      Record: {
        Id: string;
        Name: { value: string | null } | null;
        Industry: { value: string | null } | null;
      } | null;
    };
  };
}

const INDUSTRY_OPTIONS = [
  '',
  'Agriculture',
  'Apparel',
  'Banking',
  'Biotechnology',
  'Chemicals',
  'Communications',
  'Construction',
  'Consulting',
  'Education',
  'Electronics',
  'Energy',
  'Engineering',
  'Entertainment',
  'Finance',
  'Government',
  'Healthcare',
  'Hospitality',
  'Insurance',
  'Manufacturing',
  'Media',
  'Not For Profit',
  'Retail',
  'Technology',
  'Telecommunications',
  'Transportation',
  'Utilities',
  'Other',
];

export default function QueryMutationTogether() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  // Inline edit state
  const [editId, setEditId] = useState<string>();
  const [editName, setEditName] = useState('');
  const [editIndustry, setEditIndustry] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  useEffect(() => {
    (async () => {
      try {
        const sdk = await createDataSDK();
        const res = await sdk.graphql?.<ListResponse>(LIST_QUERY);
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

  function startEdit(account: Account) {
    setEditId(account.Id);
    setEditName(account.Name?.value ?? '');
    setEditIndustry(account.Industry?.value ?? '');
    setSaveError(undefined);
  }

  function cancelEdit() {
    setEditId(undefined);
    setSaveError(undefined);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editId || !editName.trim()) return;

    setSaving(true);
    setSaveError(undefined);

    try {
      const sdk = await createDataSDK();
      const res = await sdk.graphql?.<UpdateResponse>(UPDATE_MUTATION, {
        input: {
          Id: editId,
          Account: { Name: editName, Industry: editIndustry },
        },
      });

      if (res?.errors?.length) {
        throw new Error(res.errors.map((e: { message: string }) => e.message).join('; '));
      }

      const record = res?.data.uiapi?.AccountUpdate?.Record;
      if (!record) throw new Error('No record returned from AccountUpdate');

      // Update the single row in local state using the server response —
      // no re-fetch needed for a simple field update
      setAccounts(prev =>
        prev.map(a =>
          a.Id === editId
            ? {
                ...a,
                Name: { value: record.Name?.value ?? '' },
                Industry: { value: record.Industry?.value ?? '' },
              }
            : a
        )
      );
      setEditId(undefined);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm">Loading…</p>;

  if (error) return <p className="text-xs text-destructive">{error}</p>;

  if (accounts.length === 0)
    return <p className="text-muted-foreground">No accounts found.</p>;

  return (
    <table
      className="w-full text-sm [&_th]:border-b [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium [&_td]:border-b [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-accent/50"
      style={{ width: '100%' }}
    >
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Industry</th>
          <th scope="col" style={{ width: '6rem' }}></th>
        </tr>
      </thead>
      <tbody>
        {accounts.map(account => (
          <tr key={account.Id}>
            {editId === account.Id ? (
              // Inline edit row — spans all columns
              <td colSpan={3} style={{ padding: '0.5rem' }}>
                {saveError && (
                  <p className="text-destructive text-xs mb-1">{saveError}</p>
                )}
                <form onSubmit={handleSave} className="flex gap-1 items-center">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="flex-1">
                    <select
                      className="w-full rounded-md border border-input px-3 py-2 text-sm"
                      value={editIndustry}
                      onChange={e => setEditIndustry(e.target.value)}
                    >
                      {INDUSTRY_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>
                          {opt || '— None —'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button type="submit" disabled={saving}>
                      {saving ? '…' : 'Save'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEdit}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </td>
            ) : (
              // Read-only row
              <>
                <td>{account.Name?.value}</td>
                <td className="text-muted-foreground">
                  {account.Industry?.value ?? '—'}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <Button
                    variant="outline"
                    onClick={() => startEdit(account)}
                    disabled={editId !== undefined}
                  >
                    Edit
                  </Button>
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
