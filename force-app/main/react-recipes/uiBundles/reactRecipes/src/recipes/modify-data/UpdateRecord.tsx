/**
 * Update a Record
 *
 * Loads an Account and lets you edit Name and Industry via the AccountUpdate
 * mutation.
 *
 * LWC equivalent: updateRecord() from lightning/uiRecordApi automatically
 * notifies @wire adapters of the change. Here you patch local state manually
 * from the server response — there is no automatic cache invalidation.
 *
 * @see DeleteRecord — removing records with a confirmation pattern
 */
import { useEffect, useState, type FormEvent } from 'react';
import { createDataSDK, gql } from '@salesforce/sdk-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ── Read: load one Account to populate the form ──────────────────────────────
const LOAD_QUERY = gql`
  query FirstAccount {
    uiapi {
      query {
        Account(first: 1) {
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

interface LoadResponse {
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

export default function UpdateRecord() {
  const [accountId, setAccountId] = useState<string>();
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>();

  // Load the first available Account to pre-populate the form
  useEffect(() => {
    (async () => {
      try {
        const sdk = await createDataSDK();
        const res = await sdk.graphql?.<LoadResponse>({ query: LOAD_QUERY });
        if (res?.errors?.length) {
          throw new Error(res.errors.map((e: { message: string }) => e.message).join('; '));
        }
        const node = res?.data.uiapi?.query?.Account?.edges?.[0]?.node;
        if (node) {
          setAccountId(node.Id);
          setName(node.Name?.value ?? '');
          setIndustry(node.Industry?.value ?? '');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Request failed');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!accountId) return;

    setSubmitting(true);
    setSuccess(false);
    setError(undefined);

    try {
      const sdk = await createDataSDK();
      const res = await sdk.graphql?.<UpdateResponse>({
        query: UPDATE_MUTATION,
        variables: {
          // Id is a top-level field on the input, not nested inside Account
          input: { Id: accountId, Account: { Name: name, Industry: industry } },
        },
      });

      if (res?.errors?.length) {
        throw new Error(res.errors.map((e: { message: string }) => e.message).join('; '));
      }

      const record = res?.data.uiapi?.AccountUpdate?.Record;
      if (!record) throw new Error('No record returned from AccountUpdate');

      // Sync local state with values returned from the server response
      setName(record.Name?.value ?? '');
      setIndustry(record.Industry?.value ?? '');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-sm">Loading…</p>;

  if (!accountId && !error) {
    return <p className="text-muted-foreground">No accounts found.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {success && (
        <div
          className="rounded-md bg-emerald-50 border border-emerald-200 p-4 text-emerald-700"
          role="status"
        >
          <span className="sr-only">success</span>
          <div>
            <p className="text-xs">Account updated successfully.</p>
          </div>
        </div>
      )}

      {error && (
        <div
          className="rounded-md bg-rose-50 border border-rose-200 p-4 text-rose-700"
          role="alert"
        >
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-1 mb-2">
          <label className="text-sm font-medium" htmlFor="update-name">
            <span className="text-destructive">*</span> Account Name
          </label>
          <div>
            <Input
              id="update-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1 mb-4">
          <label className="text-sm font-medium" htmlFor="update-industry">
            Industry
          </label>
          <div>
            <select
              id="update-industry"
              className="w-full rounded-md border border-input px-3 py-2 text-sm"
              value={industry}
              onChange={e => setIndustry(e.target.value)}
            >
              {INDUSTRY_OPTIONS.map(opt => (
                <option key={opt} value={opt}>
                  {opt || '— None —'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button type="submit" disabled={submitting || !name.trim()}>
          {submitting ? 'Saving…' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
}
