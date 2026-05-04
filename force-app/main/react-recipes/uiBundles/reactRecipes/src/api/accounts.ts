import { createDataSDK, gql } from '@salesforce/sdk-data';
import { GetAccountsWithContactsQuery } from './graphql-operations-types';

const GET_ACCOUNTS_WITH_CONTACTS = gql`
  query GetAccountsWithContacts {
    uiapi {
      query {
        Account(first: 5, orderBy: { Name: { order: ASC } }) {
          edges {
            node {
              Id
              Name {
                value
              }
              Industry {
                value
              }
              Contacts {
                edges {
                  node {
                    Id
                    Name {
                      value
                    }
                    Title {
                      value
                    }
                    Phone {
                      value
                    }
                    Picture__c {
                      value
                    }
                  }
                }
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
      GetAccountsWithContactsQuery['uiapi']['query']['Account']
    >['edges']
  >[number]
>['node'];

export type AccountWithContacts = NonNullable<AccountNode>;

export async function getAccountsWithContacts(): Promise<
  AccountWithContacts[]
> {
  const sdk = await createDataSDK();
  const result = await sdk.graphql?.<GetAccountsWithContactsQuery>({
    query: GET_ACCOUNTS_WITH_CONTACTS,
  });

  if (result?.errors?.length) {
    throw new Error(result.errors.map(e => e.message).join('; '));
  }

  return (result?.data.uiapi?.query?.Account?.edges ?? [])
    .map(edge => edge?.node)
    .filter((node): node is AccountWithContacts => node != null);
}
