/**
 * Single Record
 *
 * Queries a single Contact via UIAPI GraphQL and displays its fields.
 * In LWC you'd reach for @wire(getRecord); here useEffect fires on mount
 * and you manage loading, error, and data as useState variables yourself.
 *
 * LWC equivalent: @wire(getRecord) with a record ID and field list.
 * The @wire decorator handles loading/error states automatically via
 * data and error properties. Here you own all three as useState variables.
 *
 * @see ListOfRecords — querying multiple records
 */
import { useEffect, useState } from 'react';
import { createDataSDK, gql } from '@salesforce/sdk-data';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// UIAPI GraphQL wraps every query under uiapi.query.<Object>.
// Results use the Relay connection pattern: edges → node → fields.
// Every scalar field is wrapped in { value } — unique to Salesforce GraphQL
// where fields are plain strings. If you've used record.fields.Name.value
// in LWC, this is the same shape.
const QUERY = gql`
  query SingleContact {
    uiapi {
      query {
        Contact(
          where: { Picture__c: { ne: null } }
          first: 1
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

// Response type mirrors the query — every UIAPI query nests under uiapi.query
interface SingleContactResponse {
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

// Flat interface for component state — avoids Awaited<ReturnType<...>> gymnastics
interface ContactFields {
  id: string;
  name: string;
  title: string | null;
  phone: string | null;
  pictureUrl: string | null;
}

export default function SingleRecord() {
  const [contact, setContact] = useState<ContactFields>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchContact = async () => {
      const sdk = await createDataSDK();
      const result = await sdk.graphql?.<SingleContactResponse>(QUERY);

      // GraphQL errors don't throw — they're returned in the errors array
      // alongside partial data. Always check before reading data.
      if (result?.errors?.length) {
        throw new Error(
          result.errors.map((e: { message: string }) => e.message).join('; ')
        );
      }

      // Unwrap: uiapi → query → Contact → edges[0] → node
      const node = result?.data?.uiapi?.query?.Contact?.edges?.[0]?.node;
      if (node) {
        // Unwrap { value } wrappers into a flat interface
        setContact({
          id: node.Id,
          name: node.Name?.value ?? 'Unknown',
          title: node.Title?.value ?? null,
          phone: node.Phone?.value ?? null,
          pictureUrl: node.Picture__c?.value ?? null,
        });
      }
    };

    fetchContact()
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Request failed');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm">Loading…</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!contact) return <p>No contacts found.</p>;

  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        {contact.pictureUrl && (
          <Avatar className="h-12 w-12">
            <AvatarImage src={contact.pictureUrl} alt={contact.name} />
            <AvatarFallback>{contact.name[0]}</AvatarFallback>
          </Avatar>
        )}
        <div className="min-w-0">
          <p className="text-lg font-semibold">{contact.name}</p>
          {contact.title && (
            <p className="text-xs text-muted-foreground">{contact.title}</p>
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
    </div>
  );
}
