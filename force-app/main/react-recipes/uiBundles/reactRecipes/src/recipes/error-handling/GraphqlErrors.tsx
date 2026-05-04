/**
 * GraphQL Error Handling
 *
 * Executes a query that intentionally requests a nonexistent field to trigger
 * a GraphQL error. UIAPI surfaces these in result.errors[] rather than
 * throwing — run both queries to see the difference between query-level
 * errors and thrown exceptions.
 *
 * LWC equivalent: @wire with the graphql adapter provides errors via the
 * error property. Imperative calls return errors in the result object.
 *
 * @see ErrorBoundaryRecipe — catching render-time JavaScript errors
 */
import { useState } from 'react';
import { createDataSDK, gql } from '@salesforce/sdk-data';
import { Button } from '@/components/ui/button';

// This query intentionally asks for a field that doesn't exist on Account.
// UIAPI will return a result.errors[] array rather than throwing an exception.
const BAD_QUERY = `
  query BadAccountQuery {
    uiapi {
      query {
        Account(first: 1) {
          edges {
            node {
              Id
              NonExistentField__c { value }
            }
          }
        }
      }
    }
  }
`;

const GOOD_QUERY = gql`
  query GoodAccountQuery {
    uiapi {
      query {
        Account(first: 1) {
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

interface GraphQLError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: string[];
}

export default function GraphqlErrors() {
  const [errors, setErrors] = useState<GraphQLError[]>();
  const [success, setSuccess] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function runQuery(query: string, label: string) {
    setLoading(true);
    setErrors(undefined);
    setSuccess(undefined);

    try {
      const sdk = await createDataSDK();
      const result = await sdk.graphql?.({ query });

      // Layer 1: result.errors[] — query-level errors (bad fields, auth, etc.)
      if (result?.errors?.length) {
        setErrors(result.errors);
        return;
      }

      setSuccess(`${label} succeeded — no errors.`);
    } catch (err) {
      // Layer 2: thrown exceptions — network failures, SDK errors
      setErrors([
        {
          message: err instanceof Error ? err.message : 'Request failed',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Button
          variant="outline"
          className="border-rose-300 text-rose-600 hover:bg-rose-50"
          onClick={() => runQuery(BAD_QUERY, 'Bad query')}
          disabled={loading}
        >
          Run Bad Query
        </Button>
        <Button
          onClick={() => runQuery(GOOD_QUERY, 'Good query')}
          disabled={loading}
        >
          Run Good Query
        </Button>
      </div>

      {loading && <p className="text-sm">Executing…</p>}

      {errors && (
        <div
          className="rounded-md bg-rose-50 border border-rose-200 p-4 text-rose-700"
          role="alert"
        >
          <p className="text-xs mb-1">
            <strong>
              {errors.length} error{errors.length > 1 ? 's' : ''} returned
            </strong>
          </p>
          <ul className="list-disc pl-5">
            {errors.map((e, i) => (
              <li key={i} className="text-xs">
                {e.message}
                {e.path && (
                  <span className="text-muted-foreground">
                    {' '}
                    — path: {e.path.join('.')}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {success && (
        <div
          className="rounded-md bg-emerald-50 border border-emerald-200 p-4 text-emerald-700"
          role="status"
        >
          <p className="text-xs">{success}</p>
        </div>
      )}
    </div>
  );
}
