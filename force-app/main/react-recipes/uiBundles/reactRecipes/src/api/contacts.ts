import { createDataSDK, gql } from '@salesforce/sdk-data';
import { GetContactsQuery } from './graphql-operations-types';

const GET_CONTACTS = gql`
  query GetContacts {
    uiapi {
      query {
        Contact(
          where: { Picture__c: { ne: null } }
          first: 3
          orderBy: { Name: { order: ASC } }
        ) {
          edges {
            node {
              Id
              Name {
                value
              }
              Phone {
                value
              }
              Picture__c: Picture__c {
                value
              }
              Title {
                value
              }
            }
          }
        }
      }
    }
  }
`;

type ContactNode = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<GetContactsQuery['uiapi']['query']['Contact']>['edges']
    >[number]
  >['node']
>;

export type Contact = ContactNode;

export async function getContacts(): Promise<(ContactNode | undefined)[]> {
  const sdk = await createDataSDK();
  const result = await sdk.graphql?.<GetContactsQuery>(GET_CONTACTS);

  if (result?.errors?.length) {
    throw new Error(result.errors.map(e => e.message).join('; '));
  }

  const connection = result?.data.uiapi?.query?.Contact;

  return (connection?.edges ?? [])
    .map(edge => edge?.node)
    .filter(node => node != null);
}
