/**
 * Paginated List
 *
 * Fetches two Contacts at a time using Relay cursor pagination (first / after).
 * Each "Load More" click passes pageInfo.endCursor as $after, appending the
 * next page to local state.
 *
 * Key Concepts:
 * - Cursor-based pagination using the `after` argument
 * - `pageInfo.hasNextPage` to know when more data exists
 * - `pageInfo.endCursor` as the opaque cursor for the next page
 * - Accumulating pages into a single list via useState
 *
 * LWC equivalent: @wire with the graphql adapter supports pagination
 * via the same cursor pattern — pass the endCursor as a reactive variable.
 *
 * @see RelatedRecords — traversing parent-child relationships
 */
import { useEffect, useState } from 'react';
import { createDataSDK, gql } from '@salesforce/sdk-data';
import { Button } from '@/components/ui/button';

// The $after variable is a cursor string returned by pageInfo.endCursor.
// Pass it on the next request to fetch the next page of results.
// Omit $after (or pass null) to start from the beginning.
const QUERY = gql`
  query PaginatedContacts($after: String) {
    uiapi {
      query {
        Contact(first: 2, after: $after, orderBy: { Name: { order: ASC } }) {
          pageInfo {
            hasNextPage
            endCursor
          }
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

interface PaginatedContactsResponse {
  uiapi: {
    query: {
      Contact: {
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string | null;
        };
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

export default function PaginatedList() {
  const [contacts, setContacts] = useState<ContactFields[]>([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string>();

  async function fetchPage(after?: string | null) {
    const sdk = await createDataSDK();
    // Pass the cursor as a GraphQL variable — omit for the first page
    const variables = after ? { after } : {};
    const result = await sdk.graphql?.<PaginatedContactsResponse>({
      query: QUERY,
      variables,
    });

    if (result?.errors?.length) {
      throw new Error(
        result.errors.map((e: { message: string }) => e.message).join('; ')
      );
    }

    const connection = result?.data?.uiapi?.query?.Contact;
    const nodes = (connection?.edges ?? [])
      .map(edge => edge?.node)
      .filter(Boolean) // edges can contain null nodes in UIAPI — filter before mapping
      .map(node => ({
        id: node.Id,
        name: node.Name?.value ?? 'Unknown',
        title: node.Title?.value ?? null,
      }));

    return {
      contacts: nodes as ContactFields[],
      // pageInfo tells us whether more pages exist and the cursor to fetch them
      hasNextPage: connection?.pageInfo?.hasNextPage ?? false,
      endCursor: connection?.pageInfo?.endCursor ?? null,
    };
  }

  // Load the first page on mount
  useEffect(() => {
    fetchPage()
      .then(page => {
        setContacts(page.contacts);
        setHasNextPage(page.hasNextPage);
        setEndCursor(page.endCursor);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Request failed');
      })
      .finally(() => setLoading(false));
  }, []);

  function loadMore() {
    if (!endCursor) return;
    setLoadingMore(true);
    fetchPage(endCursor)
      .then(page => {
        // Append new contacts to existing list — cursor pagination accumulates
        setContacts(prev => [...prev, ...page.contacts]);
        setHasNextPage(page.hasNextPage);
        setEndCursor(page.endCursor);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Request failed');
      })
      .finally(() => setLoadingMore(false));
  }

  if (loading) return <p className="text-sm">Loading…</p>;

  if (error) return <p className="text-destructive">{error}</p>;

  return (
    <div className="rounded-md border border-border bg-card p-4 shadow-sm">
      <ul>
        {contacts.map(contact => (
          <li
            key={contact.id}
            className="py-2 -mx-2 px-2 rounded-md transition-colors hover:bg-accent/50"
          >
            <p className="text-sm text-foreground">{contact.name}</p>
            {contact.title && (
              <p className="text-xs text-muted-foreground">{contact.title}</p>
            )}
          </li>
        ))}
      </ul>

      {hasNextPage && (
        <div className="mt-2">
          <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? 'Loading…' : 'Load More'}
          </Button>
        </div>
      )}

      {!hasNextPage && contacts.length > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          All {contacts.length} contacts loaded.
        </p>
      )}
    </div>
  );
}
