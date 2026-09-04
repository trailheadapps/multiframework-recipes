import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { createDataSDK, gql } from '@salesforce/platform-sdk';
import { ButtonImports } from '../../../components/ui/button/button';

// Intentionally asks for a field that doesn't exist on Account. UIAPI returns
// a result.errors[] array rather than throwing — so it's a plain string, not a
// gql tag (there's nothing valid to highlight).
const BAD_QUERY = `
	query BadAccountQuery {
		uiapi {
			query {
				Account(first: 1) {
					edges {
						node {
							Id
							NonExistentField__c {
								value
							}
						}
					}
				}
			}
		}
	}
`;

const GOOD_QUERY = gql`
	query GoodAccountQuery {
		uiapi {
			query {
				Account(first: 1) {
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
 * GraphQL Error Handling
 *
 * Runs a query that requests a nonexistent field. UIAPI surfaces such problems
 * in result.errors[] (each with a message and often a path) rather than
 * throwing — so there are two layers to handle: query-level errors you read off
 * the result, and thrown exceptions (network/SDK) you catch. Run both queries
 * to see the difference.
 *
 * LWC equivalent: @wire with the GraphQL adapter hands you problems via its
 * error property; here you read them off result.errors[] yourself.
 *
 * @see ErrorBoundaryComponent — containing render-time exceptions
 */
@Component({
	selector: 'app-graphql-errors',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ButtonImports],
	templateUrl: './graphql-errors.html',
})
export class GraphqlErrorsComponent {
	protected readonly errors = signal<GraphqlError[] | undefined>(undefined);
	protected readonly success = signal<string | undefined>(undefined);
	protected readonly loading = signal(false);

	protected runBad(): void {
		this.run(BAD_QUERY, 'Bad query');
	}

	protected runGood(): void {
		this.run(GOOD_QUERY, 'Good query');
	}

	private async run(query: string, label: string): Promise<void> {
		this.loading.set(true);
		this.errors.set(undefined);
		this.success.set(undefined);
		try {
			const sdk = await createDataSDK();
			const result = await sdk.graphql?.query({ query });

			// Layer 1: query-level errors (bad fields, auth, etc.) — returned, not thrown.
			if (result?.errors?.length) {
				this.errors.set(
					result.errors.map((e: GraphqlError) => ({ message: e.message, path: e.path })),
				);
				return;
			}

			this.success.set(`${label} succeeded — no errors.`);
		} catch (err) {
			// Layer 2: thrown exceptions — network failures, SDK errors.
			this.errors.set([{ message: err instanceof Error ? err.message : 'Request failed' }]);
		} finally {
			this.loading.set(false);
		}
	}
}

interface GraphqlError {
	message: string;
	// UIAPI usually includes the path to the offending field, e.g.
	// ["uiapi","query","Account"]. Thrown (network/SDK) errors have no path.
	path?: string[];
}
