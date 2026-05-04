/**
 * Related Records
 *
 * Queries Contacts with their parent Account in a single GraphQL request,
 * traversing a lookup relationship. In LWC this requires separate @wire calls;
 * here one query covers both objects.
 *
 * Key Concepts:
 * - Parent-child relationships via relationship name traversal (e.g. Account)
 * - Nested fields under the relationship name (Account.Name)
 * - Equivalent to SOQL's Contact.Account.Name dot notation
 *
 * LWC equivalent: @wire(getRecord) with spanning fields like
 * 'Contact.Account.Name', or separate @wire calls for parent and child.
 *
 * @see AliasedMultiObjectQuery — querying multiple objects in one request
 */
import { useEffect, useState } from 'react';
import { createDataSDK, gql } from '@salesforce/sdk-data';

// To traverse a lookup, nest the parent object's fields under the
// relationship name. Here Contact.AccountId becomes `Account { Name { value } }`.
// In SOQL this would be Contact.Account.Name — same idea, GraphQL syntax.
const QUERY = gql`
  query ContactsWithAccount {
    uiapi {
      query {
        Contact(first: 10, orderBy: { Name: { order: ASC } }) {
          edges {
            node {
              Id
              Name @optional {
                value
              }
              Title @optional {
                value
              }
              Account {
                Name @optional {
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

interface ContactsWithAccountResponse {
  uiapi: {
    query: {
      Contact: {
        edges: Array<{
          node: {
            Id: string;
            Name: { value: string | null };
            Title: { value: string | null };
            // The parent Account is nested under the lookup relationship name
            Account: { Name: { value: string | null } } | null;
          };
        }>;
      };
    };
  };
}

interface ContactWithAccount {
  id: string;
  name: string;
  title: string | null;
  accountName: string | null;
}

export default function RelatedRecords() {
  const [contacts, setContacts] = useState<ContactWithAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchContacts = async () => {
      const sdk = await createDataSDK();
      const result = await sdk.graphql?.<ContactsWithAccountResponse>({ query: QUERY });

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
            // The parent Account is nested under the relationship name
            accountName: node.Account?.Name?.value ?? null,
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
      <ColumnHeaders />
      <ul>
        {contacts.map(contact => (
          <li
            key={contact.id}
            className="-mx-2 px-2 rounded-md transition-colors hover:bg-accent/50"
          >
            <div className="flex gap-4 items-center py-2">
              <div style={{ flex: '0 0 50%' }}>
                <span className="text-sm text-foreground">{contact.name}</span>
                {contact.title && (
                  <span className="text-xs text-muted-foreground ml-1">
                    — {contact.title}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <span className="text-sm text-foreground">
                  {contact.accountName ?? (
                    <em className="text-muted-foreground">—</em>
                  )}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ColumnHeaders() {
  return (
    <div className="flex gap-4 mb-1 border-b border-border pb-1.5">
      <span
        className="text-xs text-muted-foreground"
        style={{ flex: '0 0 50%' }}
      >
        <strong>Contact</strong>
      </span>
      <span className="flex-1 text-xs text-muted-foreground">
        <strong>Account</strong>
      </span>
    </div>
  );
}
