import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { createDataSDK, gql } from '@salesforce/platform-sdk';

// The Relay connection pattern wraps records in edges[].node rather than a
// plain array — so the query asks for edges → node → fields.
const QUERY = gql`
	query ListContacts {
		uiapi {
			query {
				Contact(where: { Picture__c: { ne: null } }, first: 5, orderBy: { Name: { order: ASC } }) {
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

/**
 * List of Records
 *
 * Queries multiple Contacts via UIAPI GraphQL and renders each one. The
 * response uses the Relay connection shape, so records arrive as edges[].node.
 *
 * LWC equivalent: a @wire graphql adapter or an Apex method returning
 * List<SObject>. Here you flatten edges → node into a plain array yourself.
 *
 * @see FilteredListComponent — adding a search filter with GraphQL variables
 */
@Component({
	selector: 'app-list-of-records',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './list-of-records.html',
})
export class ListOfRecordsComponent implements OnInit {
	protected readonly contacts = signal<ContactFields[] | undefined>(undefined);
	protected readonly error = signal<string | undefined>(undefined);

	async ngOnInit(): Promise<void> {
		try {
			const sdk = await createDataSDK();
			const result = await sdk.graphql?.query<ListContactsResponse>({ query: QUERY });

			if (result?.errors?.length) {
				throw new Error(result.errors.map((e: { message: string }) => e.message).join('; '));
			}

			// edges can contain null nodes in UIAPI — filter before mapping.
			const edges = result?.data?.uiapi?.query?.Contact?.edges ?? [];
			this.contacts.set(
				edges
					.map((edge) => edge?.node)
					.filter((node): node is ContactNode => node != null)
					.map((node) => ({
						id: node.Id,
						name: node.Name?.value ?? 'Unknown',
						title: node.Title?.value ?? null,
						phone: node.Phone?.value ?? null,
						pictureUrl: node.Picture__c?.value ?? null,
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
	Phone: { value: string | null };
	Picture__c: { value: string | null };
}

interface ListContactsResponse {
	uiapi: {
		query: {
			Contact: {
				edges: { node: ContactNode }[];
			};
		};
	};
}

interface ContactFields {
	id: string;
	name: string;
	title: string | null;
	phone: string | null;
	pictureUrl: string | null;
}
