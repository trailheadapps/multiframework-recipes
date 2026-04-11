/**
 * Imperative Refetch
 *
 * Displays a Contact list with a "Refresh" button that re-invokes the
 * GraphQL query on demand. Unlike LWC's reactive @wire (which re-fetches
 * automatically when inputs change), React gives you full control over
 * when data is fetched.
 *
 * LWC equivalent: call refreshApex() or notifyRecordUpdateAvailable()
 * to force a @wire adapter to re-fetch. React has no built-in cache
 * invalidation — you simply call the fetch function again.
 *
 * @see CreateRecord — creating new records with GraphQL mutations
 */
import { useEffect, useState, useCallback } from 'react';
import { createDataSDK, gql } from '@salesforce/sdk-data';
import { Button } from '@/components/ui/button';

const QUERY = gql`
  query RefetchContacts {
    uiapi {
      query {
        Contact(first: 5, orderBy: { Name: { order: ASC } }) {
          edges {
            node {
              Id
              Name @optional {
                value
              }
              Title @optional {
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

export default function ImperativeRefetch() {
  const [contacts, setContacts] = useState<ContactFields[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [fetchCount, setFetchCount] = useState(0);

  // Extract the fetch logic so it can be called from useEffect and the button
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const sdk = await createDataSDK();
      const result = await sdk.graphql?.<QueryResponse>(QUERY);

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
      setFetchCount(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return (
    <div>
      <div className="flex items-center mb-2">
        {/* Unlike @wire, you decide when to re-fetch */}
        <Button variant="outline" onClick={fetchContacts} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </Button>
        <span className="text-xs text-muted-foreground ml-2">
          Fetched {fetchCount} {fetchCount === 1 ? 'time' : 'times'}
        </span>
      </div>

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
