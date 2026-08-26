import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { createDataSDK, gql } from '@salesforce/platform-sdk';

// Every scalar field in UIAPI GraphQL is wrapped in { value }. This is different
// from standard GraphQL, where fields are plain scalars.
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

/**
 * Binding to an Account Name
 *
 * Fetches an Account via UIAPI GraphQL and binds the Name field to the template.
 * A signal drives re-render when the data arrives, and the { value } wrapper on
 * every field mirrors record.fields.Name.value from @wire(getRecord).
 *
 * LWC equivalent: @wire(getRecord) with a field list, then read
 * record.fields.Name.value in the template. A signal here plays the role of a
 * reactive @track property.
 *
 * @see ConditionalStatusComponent — conditional rendering with picklist data
 */
@Component({
	selector: 'app-binding-account-name',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './binding-account-name.html',
})
export class BindingAccountNameComponent implements OnInit {
	protected readonly name = signal<string | undefined>(undefined);
	protected readonly error = signal<string | undefined>(undefined);

	async ngOnInit(): Promise<void> {
		try {
			const sdk = await createDataSDK();
			const result = await sdk.graphql?.query<QueryResponse>({ query: QUERY });

			if (result?.errors?.length) {
				throw new Error(
					result.errors.map((e: { message: string }) => e.message).join('; '),
				);
			}

			const node = result?.data?.uiapi?.query?.Account?.edges?.[0]?.node;
			// Unwrap the { value } wrapper — Salesforce's UIAPI wraps every field.
			this.name.set(node?.Name?.value ?? 'Unknown');
		} catch (err) {
			this.error.set(err instanceof Error ? err.message : 'Request failed');
		}
	}
}

interface QueryResponse {
	uiapi: {
		query: {
			Account: {
				edges: { node: { Id: string; Name: { value: string | null } } }[];
			};
		};
	};
}
