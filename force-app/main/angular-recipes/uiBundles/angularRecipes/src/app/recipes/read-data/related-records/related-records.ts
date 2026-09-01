import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { createDataSDK, gql } from '@salesforce/platform-sdk';

// To traverse a lookup, nest the parent object's fields under the relationship
// name. Contact.AccountId becomes `Account { Name { value } }` — the GraphQL
// equivalent of SOQL's Contact.Account.Name spanning field.
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

/**
 * Related Records
 *
 * Queries Contacts with their parent Account in one request, traversing a
 * lookup relationship. In LWC this needs separate @wire calls; here one query
 * covers both objects.
 *
 * LWC equivalent: @wire(getRecord) with spanning fields like
 * 'Contact.Account.Name', or two separate @wire calls.
 *
 * @see AliasedMultiObjectQueryComponent — querying unrelated objects in one request
 */
@Component({
	selector: 'app-related-records',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './related-records.html',
})
export class RelatedRecordsComponent implements OnInit {
	protected readonly contacts = signal<ContactWithAccount[] | undefined>(undefined);
	protected readonly error = signal<string | undefined>(undefined);

	async ngOnInit(): Promise<void> {
		try {
			const sdk = await createDataSDK();
			const result = await sdk.graphql?.query<ContactsWithAccountResponse>({ query: QUERY });

			if (result?.errors?.length) {
				throw new Error(result.errors.map((e: { message: string }) => e.message).join('; '));
			}

			const edges = result?.data?.uiapi?.query?.Contact?.edges ?? [];
			this.contacts.set(
				edges
					.map((edge) => edge?.node)
					.filter((node): node is ContactNode => node != null)
					.map((node) => ({
						id: node.Id,
						name: node.Name?.value ?? 'Unknown',
						title: node.Title?.value ?? null,
						// The parent Account is nested under the relationship name.
						accountName: node.Account?.Name?.value ?? null,
					})),
			);
		} catch (err) {
			this.error.set(err instanceof Error ? err.message : 'Request failed');
		}
	}
}

interface ContactNode {
	Id: string;
	Name: { value: string | null };
	Title: { value: string | null };
	Account: { Name: { value: string | null } } | null;
}

interface ContactsWithAccountResponse {
	uiapi: {
		query: {
			Contact: {
				edges: { node: ContactNode }[];
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
