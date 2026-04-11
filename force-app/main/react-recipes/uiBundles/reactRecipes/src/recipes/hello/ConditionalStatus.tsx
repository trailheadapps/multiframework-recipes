/**
 * Conditional Rendering with a Picklist Field
 *
 * Fetches an Account and conditionally renders different UI based on the
 * Industry picklist value. Demonstrates: the {condition && <Element />}
 * pattern and ternary operator with real Salesforce data.
 *
 * LWC equivalent: conditional rendering uses if:true / lwc:if directives
 * on template elements. React uses JavaScript expressions directly in JSX.
 *
 * @see ListOfAccounts — rendering a list of records with .map()
 */
import { useEffect, useState } from 'react';
import { createDataSDK, gql } from '@salesforce/sdk-data';
import { Badge } from '@/components/ui/badge';

const QUERY = gql`
  query AccountIndustry {
    uiapi {
      query {
        Account(first: 1, orderBy: { Name: { order: ASC } }) {
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

interface QueryResponse {
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

interface AccountFields {
  name: string;
  industry: string | null;
}

export default function ConditionalStatus() {
  const [account, setAccount] = useState<AccountFields>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchAccount = async () => {
      const sdk = await createDataSDK();
      const result = await sdk.graphql?.<QueryResponse>(QUERY);

      if (result?.errors?.length) {
        throw new Error(
          result.errors.map((e: { message: string }) => e.message).join('; ')
        );
      }

      const node = result?.data?.uiapi?.query?.Account?.edges?.[0]?.node;
      if (node) {
        setAccount({
          name: node.Name?.value ?? 'Unknown',
          industry: node.Industry?.value ?? null,
        });
      }
    };

    fetchAccount().catch(err => {
      setError(err instanceof Error ? err.message : 'Request failed');
    });
  }, []);

  if (error) return <p className="text-destructive">{error}</p>;
  if (!account) return <p className="text-sm">Loading…</p>;

  return (
    <div>
      <p className="text-lg font-semibold mb-1">
        {account.name}
      </p>

      {/* Conditional rendering: show industry badge or fallback */}
      {account.industry ? (
        <Badge className="bg-primary/10 text-primary border-primary/20">
          {account.industry}
        </Badge>
      ) : (
        <Badge variant="secondary">No Industry Set</Badge>
      )}
    </div>
  );
}
