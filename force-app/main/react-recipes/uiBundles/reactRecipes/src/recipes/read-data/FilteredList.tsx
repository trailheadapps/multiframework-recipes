/**
 * Filtered List with Variables
 *
 * Queries Contacts by name using a GraphQL variable bound to an input field.
 * In LWC a tracked property passed to @wire re-executes automatically; here
 * the useEffect dependency array re-runs the fetch whenever search changes.
 *
 * LWC equivalent: a @track property bound to an input field and passed to
 * @wire — the wire adapter re-fires automatically when the property changes.
 *
 * @see SortedResults — sorting query results with dynamic orderBy
 */

import { useEffect, useState } from 'react';
import { createDataSDK, gql } from '@salesforce/sdk-data';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

// The $name variable is passed at execution time via the `variables` argument.
// UIAPI supports `like` with SQL-style wildcards: %name% matches anywhere.
const QUERY = gql`
  query FilteredContacts($name: String) {
    uiapi {
      query {
        Contact(
          where: { Name: { like: $name } }
          first: 5
          orderBy: { Name: { order: ASC } }
        ) {
          edges {
            node {
              Id
              Name @optional {
                value
              }
              Title @optional {
                value
              }
              Phone @optional {
                value
              }
              Picture__c @optional {
                value
              }
            }
          }
        }
      }
    }
  }
`;

interface FilteredContactsResponse {
  uiapi: {
    query: {
      Contact: {
        edges: Array<{
          node: {
            Id: string;
            Name: { value: string | null };
            Title: { value: string | null };
            Phone: { value: string | null };
            Picture__c: { value: string | null };
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
  phone: string | null;
  pictureUrl: string | null;
}

export default function FilteredList() {
  const [search, setSearch] = useState('');
  const [contacts, setContacts] = useState<ContactFields[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!search.trim()) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(undefined);

    // Debounce: wait 300ms after the last keystroke before fetching.
    // The cleanup cancels the pending timer if search changes again before it fires.
    const timer = setTimeout(() => {
      setLoading(true);
      const fetchFiltered = async () => {
        const sdk = await createDataSDK();
        // Wrap the search term in % wildcards for the `like` operator
        const result = await sdk.graphql?.<FilteredContactsResponse>({
          query: QUERY,
          variables: { name: `%${search}%` },
        });

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
              phone: node.Phone?.value ?? null,
              pictureUrl: node.Picture__c?.value ?? null,
            }))
        );
      };

      fetchFiltered()
        .catch(err => {
          setError(err instanceof Error ? err.message : 'Request failed');
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [search]); // Re-runs whenever search changes — pass variables, get fresh results

  const visibleContacts = search.trim() ? contacts : [];

  return (
    <div>
      <div className="space-y-1 mb-2">
        <Input
          type="text"
          placeholder="Search by name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading && (
        <p className="text-sm mt-2">Loading…</p>
      )}

      {error && (
        <p className="text-destructive mt-2">{error}</p>
      )}

      {!loading && visibleContacts.length === 0 && search.trim() && (
        <p className="text-muted-foreground mt-2">
          No contacts found.
        </p>
      )}

      {visibleContacts.length > 0 && (
        <div className="rounded-md border border-border bg-card p-4 shadow-sm">
          <ul className="divide-y">
            {visibleContacts.map(contact => (
              <li
                key={contact.id}
                className="py-2 -mx-2 px-2 rounded-md transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center gap-3">
                  {contact.pictureUrl && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={contact.pictureUrl} alt={contact.name} />
                      <AvatarFallback>{contact.name[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">
                      {contact.name}
                    </p>
                    {contact.title && (
                      <p className="text-xs text-muted-foreground">
                        {contact.title}
                      </p>
                    )}
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {contact.phone}
                      </a>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
