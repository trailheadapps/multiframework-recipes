/**
 * Lifecycle: Fetch on Mount with Cleanup
 *
 * Uses useEffect to fetch a Contact when the component mounts.
 * A stale flag prevents state updates after unmount.
 *
 * LWC equivalent: connectedCallback fires on mount and disconnectedCallback
 * fires on unmount. The useEffect cleanup function serves the same purpose
 * as disconnectedCallback — cancelling in-flight work when the component
 * is removed from the DOM.
 *
 * Toggle the button to observe mount/unmount behavior.
 *
 * @see SingleRecord — querying a single record with GraphQL
 */
import { useEffect, useState } from 'react';
import { createDataSDK, gql } from '@salesforce/sdk-data';
import { Button } from '@/components/ui/button';

const QUERY = gql`
  query FirstContact {
    uiapi {
      query {
        Contact(first: 1, orderBy: { Name: { order: ASC } }) {
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
  name: string;
  title: string | null;
}

export default function LifecycleFetch() {
  const [mounted, setMounted] = useState(true);

  return (
    <div>
      <Button variant="outline" onClick={() => setMounted(m => !m)}>
        {mounted ? 'Unmount' : 'Mount'} Contact Fetcher
      </Button>
      {mounted && <ContactFetcher />}
    </div>
  );
}

function ContactFetcher() {
  const [contact, setContact] = useState<ContactFields>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    // Stale flag prevents setState after unmount — the cleanup pattern
    let stale = false;

    const fetchContact = async () => {
      const sdk = await createDataSDK();
      const result = await sdk.graphql?.<QueryResponse>(QUERY);

      if (stale) return; // component was unmounted while fetching

      if (result?.errors?.length) {
        throw new Error(
          result.errors.map((e: { message: string }) => e.message).join('; ')
        );
      }

      const node = result?.data?.uiapi?.query?.Contact?.edges?.[0]?.node;
      if (node) {
        setContact({
          name: node.Name?.value ?? 'Unknown',
          title: node.Title?.value ?? null,
        });
      }
    };

    fetchContact()
      .catch(err => {
        if (!stale) {
          setError(err instanceof Error ? err.message : 'Request failed');
        }
      })
      .finally(() => {
        if (!stale) setLoading(false);
      });

    // Cleanup: mark as stale so in-flight fetches don't update state
    return () => {
      stale = true;
    };
  }, []);

  if (loading) return <p className="text-sm mt-2">Fetching contact…</p>;
  if (error) return <p className="text-destructive mt-2">{error}</p>;
  if (!contact) return <p className="text-sm mt-2">No contact found.</p>;

  return (
    <div className="rounded-md border border-border bg-card p-4 mt-2">
      <p className="text-sm">
        <strong>{contact.name}</strong>
      </p>
      {contact.title && (
        <p className="text-xs text-muted-foreground">{contact.title}</p>
      )}
    </div>
  );
}
