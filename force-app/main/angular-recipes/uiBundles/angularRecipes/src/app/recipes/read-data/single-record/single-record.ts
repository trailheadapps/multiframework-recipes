import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { createDataSDK, gql } from '@salesforce/platform-sdk';

// UIAPI wraps every query under uiapi.query.<Object> using the Relay connection
// shape (edges → node). Each scalar is wrapped in { value } — the same shape as
// record.fields.Name.value in LWC. @optional lets a field resolve to null
// instead of failing the whole query.
const QUERY = gql`
	query SingleContact {
		uiapi {
			query {
				Contact(where: { Picture__c: { ne: null } }, first: 1, orderBy: { Name: { order: ASC } }) {
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
 * Single Record
 *
 * Queries a single Contact via UIAPI GraphQL and displays its fields.
 *
 * LWC equivalent: @wire(getRecord) with a record Id and field list exposes
 * data/error automatically. Here you fetch in ngOnInit and own loading, error,
 * and data as signals.
 *
 * @see ListOfRecordsComponent — querying multiple records
 */
@Component({
	selector: 'app-single-record',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './single-record.html',
})
export class SingleRecordComponent implements OnInit {
	protected readonly contact = signal<ContactFields | undefined>(undefined);
	protected readonly loading = signal(true);
	protected readonly error = signal<string | undefined>(undefined);

	async ngOnInit(): Promise<void> {
		try {
			const sdk = await createDataSDK();
			const result = await sdk.graphql?.query<SingleContactResponse>({ query: QUERY });

			// GraphQL errors are returned in result.errors, not thrown — check first.
			if (result?.errors?.length) {
				throw new Error(result.errors.map((e: { message: string }) => e.message).join('; '));
			}

			// Unwrap: uiapi → query → Contact → edges[0] → node, then flatten { value }.
			const node = result?.data?.uiapi?.query?.Contact?.edges?.[0]?.node;
			if (node) {
				this.contact.set({
					id: node.Id,
					name: node.Name?.value ?? 'Unknown',
					title: node.Title?.value ?? null,
					phone: node.Phone?.value ?? null,
					pictureUrl: node.Picture__c?.value ?? null,
				});
			}
		} catch (err) {
			this.error.set(err instanceof Error ? err.message : 'Request failed');
		} finally {
			this.loading.set(false);
		}
	}
}

interface SingleContactResponse {
	uiapi: {
		query: {
			Contact: {
				edges: {
					node: {
						Id: string;
						Name: { value: string | null };
						Title: { value: string | null };
						Phone: { value: string | null };
						Picture__c: { value: string | null };
					};
				}[];
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
