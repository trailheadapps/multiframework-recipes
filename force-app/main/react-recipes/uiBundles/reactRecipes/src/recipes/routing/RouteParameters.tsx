/**
 * Route Parameters
 *
 * An Account list links to a detail view using a dynamic route parameter
 * (:accountId). Clicking an account navigates to /route-parameters/:accountId
 * where useParams reads the ID and fetches that record.
 *
 * LWC equivalent: read the record ID from @wire(CurrentPageReference)
 * via pageRef.state.recordId. React Router's useParams() extracts named
 * segments from the URL pattern.
 *
 * Click an Account name to navigate to /route-parameters/:accountId
 * and load that record's detail view.
 *
 * @see NestedRoutes — master-detail layout with shared outlet context
 */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { createDataSDK, gql } from '@salesforce/sdk-data';

const LIST_QUERY = gql`
  query AccountsForRouting {
    uiapi {
      query {
        Account(first: 5, orderBy: { Name: { order: ASC } }) {
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

const DETAIL_QUERY = gql`
  query AccountById($id: ID) {
    uiapi {
      query {
        Account(where: { Id: { eq: $id } }, first: 1) {
          edges {
            node {
              Id
              Name @optional {
                value
              }
              Industry @optional {
                value
              }
              Phone @optional {
                value
              }
              Website @optional {
                value
              }
            }
          }
        }
      }
    }
  }
`;

interface ListResponse {
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

interface DetailResponse {
  uiapi: {
    query: {
      Account: {
        edges: Array<{
          node: {
            Id: string;
            Name: { value: string | null };
            Industry: { value: string | null };
            Phone: { value: string | null };
            Website: { value: string | null };
          };
        }>;
      };
    };
  };
}

/** Index route — list of accounts with links to the detail route */
export function RouteParametersList() {
  const [accounts, setAccounts] = useState<
    { id: string; name: string; industry: string | null }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetch = async () => {
      const sdk = await createDataSDK();
      const result = await sdk.graphql?.<ListResponse>(LIST_QUERY);

      if (result?.errors?.length) {
        throw new Error(
          result.errors.map((e: { message: string }) => e.message).join('; ')
        );
      }

      const edges = result?.data?.uiapi?.query?.Account?.edges ?? [];
      setAccounts(
        edges
          .map(edge => edge?.node)
          .filter(Boolean) // edges can contain null nodes in UIAPI — filter before mapping
          .map(node => ({
            id: node.Id,
            name: node.Name?.value ?? 'Unknown',
            industry: node.Industry?.value ?? null,
          }))
      );
    };

    fetch()
      .catch(err =>
        setError(err instanceof Error ? err.message : 'Request failed')
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm">Loading…</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  return (
    <ul className="divide-y">
      {accounts.map(account => (
        <li key={account.id} className="py-2">
          <Link
            to={`/route-parameters/${account.id}`}
            className="text-sm text-primary hover:underline"
          >
            {account.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Detail route — reads :accountId from the URL via useParams, then fetches that record */
export function RouteParametersDetail() {
  const { accountId } = useParams();
  const [account, setAccount] = useState<{
    name: string;
    industry: string | null;
    phone: string | null;
    website: string | null;
  }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!accountId) return;

    const fetch = async () => {
      const sdk = await createDataSDK();
      const result = await sdk.graphql?.<DetailResponse>(DETAIL_QUERY, {
        id: accountId,
      });

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
          phone: node.Phone?.value ?? null,
          website: node.Website?.value ?? null,
        });
      }
    };

    fetch()
      .catch(err =>
        setError(err instanceof Error ? err.message : 'Request failed')
      )
      .finally(() => setLoading(false));
  }, [accountId]); // Re-fetch whenever the route param changes

  if (loading) return <p className="text-sm">Loading…</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!account) return <p className="text-muted-foreground">Not found.</p>;

  return (
    <div>
      <Link
        to="/routing"
        className="text-xs text-primary mb-2 inline-block hover:underline"
      >
        ← Back to list
      </Link>
      <div className="rounded-md bg-muted p-4 mt-2">
        <p className="text-lg font-semibold">{account.name}</p>
        {account.industry && (
          <p className="text-xs text-muted-foreground mt-1">
            {account.industry}
          </p>
        )}
        {account.phone && (
          <p className="text-xs mt-1">
            <a href={`tel:${account.phone}`} className="text-xs text-primary hover:underline">{account.phone}</a>
          </p>
        )}
        {account.website && (
          <p className="text-xs mt-1">
            <a href={account.website} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
              {account.website}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
