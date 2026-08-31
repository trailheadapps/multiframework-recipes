import { ChangeDetectionStrategy, Component, OnInit, input, signal } from '@angular/core';
import { createDataSDK, gql } from '@salesforce/platform-sdk';

const QUERY = gql`
	query TwoAccounts {
		uiapi {
			query {
				Account(first: 2, orderBy: { Name: { order: ASC } }) {
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
 * A pure display child. It receives its data through signal inputs and never
 * fetches anything itself — the Angular equivalent of an LWC @api property.
 */
@Component({
	selector: 'app-account-card',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './account-card.html',
})
export class AccountCardComponent {
	readonly name = input.required<string>();
	readonly industry = input<string | null>(null);
}

/**
 * Parent-to-Child (Inputs) with Salesforce Data
 *
 * The parent fetches Accounts via GraphQL and passes each one to a child
 * component through inputs. The child is a pure display component.
 *
 * LWC equivalent: child components receive data via @api properties set by the
 * parent in the template. Angular uses signal inputs — the same idea.
 *
 * @see ChildToParentComponent — communicating from child back to parent
 */
@Component({
	selector: 'app-parent-to-child',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [AccountCardComponent],
	templateUrl: './parent-to-child.html',
})
export class ParentToChildComponent implements OnInit {
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
