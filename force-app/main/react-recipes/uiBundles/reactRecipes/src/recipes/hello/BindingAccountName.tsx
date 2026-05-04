/**
 * Binding to an Account Name
 *
 * Fetches an Account via UIAPI GraphQL and binds the Name field to the UI.
 * In LWC, template expressions track reactive properties automatically; here
 * useState drives re-renders when data arrives. The { value } wrapper on every
 * field mirrors record.fields.Name.value from @wire(getRecord) — same UIAPI shape.
 *
 * LWC equivalent: @wire(getRecord) with a field list, then access
 * record.fields.Name.value in the template. useState here plays the role
 * of @track (reactive properties).
 *
 * @see ConditionalStatus — conditional rendering with picklist data
 */
import { useEffect, useState } from 'react';
import { createDataSDK, gql } from '@salesforce/sdk-data';

// Every scalar field in UIAPI GraphQL is wrapped in { value }.
// This is different from standard GraphQL where fields are plain scalars.
const QUERY = gql`
  query FirstAccountName {
    uiapi {
      query {
        Account(first: 1, orderBy: { Name: { order: ASC } }) {
          edges {
            node {
              Id
              Name @optional {
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
      Account: {
        edges: Array<{
          node: { Id: string; Name: { value: string | null } };
        }>;
      };
    };
  };
}

export default function BindingAccountName() {
  const [name, setName] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchName = async () => {
      const sdk = await createDataSDK();
      const result = await sdk.graphql?.<QueryResponse>({ query: QUERY });

      if (result?.errors?.length) {
        throw new Error(
          result.errors.map((e: { message: string }) => e.message).join('; ')
        );
      }

      const node = result?.data?.uiapi?.query?.Account?.edges?.[0]?.node;
      // Unwrap the { value } wrapper — Salesforce's UIAPI wraps every field
      setName(node?.Name?.value ?? 'Unknown');
    };

    fetchName().catch(err => {
      setError(err instanceof Error ? err.message : 'Request failed');
    });
  }, []);

  if (error) return <p className="text-destructive">{error}</p>;

  return <p className="text-lg font-semibold">{name ?? 'Loading…'}</p>;
}
