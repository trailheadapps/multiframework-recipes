import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { createDataSDK, gql } from '@salesforce/platform-sdk';

const QUERY = gql`
	query AccountList {
		uiapi {
			query {
				Account(first: 6, orderBy: { Name: { order: ASC } }) {
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
 * List Rendering with Salesforce Records
 *
 * Fetches Accounts via UIAPI GraphQL and renders them with the @for block.
 * Each item needs a stable track expression; here we track the record Id.
 *
 * LWC equivalent: list rendering uses for:each / lwc:for with a key attribute.
 * Angular uses the @for block with a track expression.
 *
 * @see ParentToChildComponent — passing data to child components via inputs
 */
@Component({
	selector: 'app-list-of-accounts',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './list-of-accounts.html',
})
export class ListOfAccountsComponent implements OnInit {
	protected readonly accounts = signal<AccountFields[] | undefined>(undefined);
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

			const edges = result?.data?.uiapi?.query?.Account?.edges ?? [];
			this.accounts.set(
				edges.map((edge) => ({
					id: edge.node.Id,
					name: edge.node.Name?.value ?? 'Unknown',
					industry: edge.node.Industry?.value ?? null,
				})),
			);
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
	id: string;
	name: string;
	industry: string | null;
}
