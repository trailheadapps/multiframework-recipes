/**
 * Sorted Results
 *
 * Fetches Contacts with an orderBy argument driven by component state.
 * Changing the sort field or direction re-runs the query via useEffect —
 * similar to passing a reactive property to @wire in LWC. Note that orderBy
 * can't use GraphQL variables in UIAPI, so the query is rebuilt on each change.
 *
 * LWC equivalent: pass a reactive sort property to @wire with the graphql
 * adapter. The wire re-fires when the property changes.
 *
 * @see PaginatedList — cursor-based pagination with Load More
 */

import { useEffect, useState } from 'react';
import { createDataSDK } from '@salesforce/sdk-data';

type SortField = 'Name' | 'Title' | 'Phone';
type SortDir = 'ASC' | 'DESC';

const SORT_FIELDS: { value: SortField; label: string }[] = [
  { value: 'Name', label: 'Name' },
  { value: 'Title', label: 'Title' },
  { value: 'Phone', label: 'Phone' },
];

// Build the query with the sort field/direction baked in.
// orderBy can't be a GraphQL variable in UIAPI, so string interpolation
// is the necessary pattern here.
function buildQuery(field: SortField, direction: SortDir): string {
  return `
    query SortedContacts {
      uiapi {
        query {
          Contact(
            first: 10
            orderBy: { ${field}: { order: ${direction} } }
          ) {
            edges {
              node {
                Id
                Name @optional { value }
                Title @optional { value }
              }
            }
          }
        }
      }
    }
  `;
}

interface SortedContactsResponse {
  uiapi: {
    query: {
      Contact: {
        edges: Array<{
          node: {
            Id: string;
            Name: { value: string | null };
            Title: { value: string | null };
          };
        }>;
      };
    };
  };
}

interface ContactFields {
  id: string;
  name: string;
  title: string | null;
}

export default function SortedResults() {
  const [field, setField] = useState<SortField>('Name');
  const [dir, setDir] = useState<SortDir>('ASC');
  const [contacts, setContacts] = useState<ContactFields[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  // Re-fetch whenever sort field or direction changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(undefined);

    const fetchSorted = async () => {
      const sdk = await createDataSDK();
      const result = await sdk.graphql?.<SortedContactsResponse>(
        buildQuery(field, dir)
      );

      if (result?.errors?.length) {
        throw new Error(
          result.errors.map((e: { message: string }) => e.message).join('; ')
        );
      }

      const edges = result?.data?.uiapi?.query?.Contact?.edges ?? [];
      setContacts(
        edges
          .map(edge => edge?.node)
          .filter(Boolean) // edges can contain null nodes in UIAPI — filter before mapping
          .map(node => ({
            id: node.Id,
            name: node.Name?.value ?? 'Unknown',
            title: node.Title?.value ?? null,
          }))
      );
    };

    fetchSorted()
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Request failed');
      })
      .finally(() => setLoading(false));
  }, [field, dir]);

  return (
    <div>
      <SortControls
        field={field}
        dir={dir}
        onFieldChange={setField}
        onDirChange={setDir}
      />

      {loading && <p className="text-sm mb-2">Loading…</p>}
      {error && <p className="text-destructive">{error}</p>}
      {!loading && !error && (
        <div className="rounded-md border border-border bg-card p-4 shadow-sm">
          <ul>
            {contacts.map(contact => (
              <li
                key={contact.id}
                className="py-2 -mx-2 px-2 rounded-md transition-colors hover:bg-accent/50"
              >
                <p className="text-sm text-foreground">{contact.name}</p>
                {contact.title && (
                  <p className="text-xs text-muted-foreground">
                    {contact.title}
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

interface SortControlsProps {
  field: SortField;
  dir: SortDir;
  onFieldChange: (f: SortField) => void;
  onDirChange: (d: SortDir) => void;
}

function SortControls({
  field,
  dir,
  onFieldChange,
  onDirChange,
}: SortControlsProps) {
  return (
    <div className="flex gap-4 items-center mb-2">
      <div className="w-1/2">
        <label className="text-sm font-medium mb-1 block" htmlFor="sort-field">
          Sort by
        </label>
        <select
          id="sort-field"
          className="w-full rounded-md border border-input px-3 py-2 text-sm"
          value={field}
          onChange={e => onFieldChange(e.target.value as SortField)}
        >
          {SORT_FIELDS.map(f => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>
      <div className="w-1/2">
        <label className="text-sm font-medium mb-1 block" htmlFor="sort-dir">
          Direction
        </label>
        <select
          id="sort-dir"
          className="w-full rounded-md border border-input px-3 py-2 text-sm"
          value={dir}
          onChange={e => onDirChange(e.target.value as SortDir)}
        >
          <option value="ASC">Ascending</option>
          <option value="DESC">Descending</option>
        </select>
      </div>
    </div>
  );
}
