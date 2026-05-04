/**
 * List of Records
 *
 * Queries multiple Contacts via UIAPI GraphQL and renders each one.
 * In LWC you'd use a @wire adapter or Apex to return an array of records.
 * Here the response uses the Relay connection shape: records arrive as
 * edges[].node instead of a plain array.
 *
 * LWC equivalent: @wire with the graphql adapter to query multiple records,
 * or @wire with an Apex method returning List<SObject>.
 *
 * @see FilteredList — adding a search filter with GraphQL variables
 */
import { useEffect, useState } from 'react';
import { createDataSDK, gql } from '@salesforce/sdk-data';

// Relay connection pattern: the response wraps records in edges[].node.
const QUERY = gql`
  query ListContacts {
    uiapi {
      query {
        Contact(
          where: { Picture__c: { ne: null } }
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

// Response type mirrors the query structure
interface ListContactsResponse {
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

export default function ListOfRecords() {
  const [contacts, setContacts] = useState<ContactFields[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchContacts = async () => {
      const sdk = await createDataSDK();
      const result = await sdk.graphql?.<ListContactsResponse>({ query: QUERY });

      if (result?.errors?.length) {
        throw new Error(
          result.errors.map((e: { message: string }) => e.message).join('; ')
        );
      }

      // Unwrap edges → node, then flatten each node's { value } wrappers
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

    fetchContacts()
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Request failed');
      })
      .finally(() => setLoading(false));
  }, []);

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
            <div className="flex items-center gap-3">
              {contact.pictureUrl && (
                <img
                  src={contact.pictureUrl}
                  alt={contact.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              )}
              <div className="min-w-0">
                <p className="text-sm text-foreground">{contact.name}</p>
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
  );
}
