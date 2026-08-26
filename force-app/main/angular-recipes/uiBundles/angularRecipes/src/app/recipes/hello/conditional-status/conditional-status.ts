import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { createDataSDK, gql } from '@salesforce/platform-sdk';

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

/**
 * Conditional Rendering with a Picklist Field
 *
 * Fetches an Account and conditionally renders different UI based on the
 * Industry picklist value, using the @if / @else template blocks with real
 * Salesforce data.
 *
 * LWC equivalent: conditional rendering uses lwc:if / lwc:else on template
 * elements. Angular uses the @if control-flow block.
 *
 * @see ListOfAccountsComponent — rendering a list of records with @for
 */
@Component({
	selector: 'app-conditional-status',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './conditional-status.html',
})
export class ConditionalStatusComponent implements OnInit {
	protected readonly account = signal<AccountFields | undefined>(undefined);
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
			if (node) {
				this.account.set({
					name: node.Name?.value ?? 'Unknown',
					industry: node.Industry?.value ?? null,
				});
			}
		} catch (err) {
			this.error.set(err instanceof Error ? err.message : 'Request failed');
		}
	}
}

interface QueryResponse {
	uiapi: {
		query: {
			Account: {
				edges: {
					node: {
						Id: string;
						Name: { value: string | null };
						Industry: { value: string | null };
					};
				}[];
			};
		};
	};
}

interface AccountFields {
	name: string;
	industry: string | null;
}
