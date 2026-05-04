import { useState, useEffect } from 'react';
import { createDataSDK, gql } from '@salesforce/sdk-data';
import type {
  GetFirstAccountQuery,
  GetAccountsQuery,
} from './graphql-operations-types';

const GET_FIRST_ACCOUNT = gql`
  query GetFirstAccount {
    uiapi {
      query {
        Account(first: 1) {
          edges {
            node {
              Id
              Name {
                value
              }
              Industry {
                value
              }
              AnnualRevenue {
                value
              }
            }
          }
        }
      }
    }
  }
`;

type AccountNode = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<GetFirstAccountQuery['uiapi']['query']['Account']>['edges']
    >[number]
  >['node']
>;

export type FirstAccount = AccountNode;

export function useFirstAccount(): {
  account: AccountNode | undefined;
  loading: boolean;
  error: string | undefined;
} {
  const [account, setAccount] = useState<AccountNode | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    getFirstAccount()
      .then(a => {
        if (a) setAccount(a);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Request failed');
      })
      .finally(() => setLoading(false));
  }, []);

  return { account, loading, error };
}

export async function getFirstAccount(): Promise<AccountNode | undefined> {
  const sdk = await createDataSDK();
  const result = await sdk.graphql?.<GetFirstAccountQuery>({ query: GET_FIRST_ACCOUNT });

  if (result?.errors?.length) {
    throw new Error(result.errors.map(e => e.message).join('; '));
  }

  return result?.data.uiapi?.query?.Account?.edges?.[0]?.node ?? undefined;
}

const GET_ACCOUNTS = gql`
  query GetAccounts {
    uiapi {
      query {
        Account(first: 10, orderBy: { Name: { order: ASC } }) {
          edges {
            node {
              Id
              Name {
                value
              }
              Industry {
                value
              }
            }
          }
        }
      }
    }
  }
`;

type AccountListNode = NonNullable<
  NonNullable<
    NonNullable<GetAccountsQuery['uiapi']['query']['Account']>['edges']
  >[number]
>['node'];

export type Account = NonNullable<AccountListNode>;

export async function getAccounts(): Promise<Account[]> {
  const sdk = await createDataSDK();
  const result = await sdk.graphql?.<GetAccountsQuery>({ query: GET_ACCOUNTS });

  if (result?.errors?.length) {
    throw new Error(result.errors.map(e => e.message).join('; '));
  }

  return (result?.data.uiapi?.query?.Account?.edges ?? [])
    .map(edge => edge?.node)
    .filter((node): node is Account => node != null);
}
