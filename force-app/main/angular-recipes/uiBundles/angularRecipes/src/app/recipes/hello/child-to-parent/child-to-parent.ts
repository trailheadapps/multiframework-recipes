import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { createDataSDK, gql } from '@salesforce/platform-sdk';

// Industry picklist values from the Account standard object.
const INDUSTRIES = [
	'Agriculture',
	'Banking',
	'Education',
	'Energy',
	'Finance',
	'Healthcare',
	'Manufacturing',
	'Retail',
	'Technology',
];

const QUERY = gql`
	query AccountsByIndustry($industry: Picklist) {
		uiapi {
			query {
				Account(
					where: { Industry: { eq: $industry } }
					first: 5
					orderBy: { Name: { order: ASC } }
				) {
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
 * A child that presents the Industry picklist and emits the chosen value. It
 * owns no data — the parent decides what to do with the selection.
 */
@Component({
	selector: 'app-industry-picker',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './industry-picker.html',
})
export class IndustryPickerComponent {
	protected readonly industries = INDUSTRIES;
	readonly industrySelected = output<string>();
}

/**
 * Child-to-Parent (Outputs) with Salesforce Data
 *
 * A child presents an Industry selector and emits an output when the user picks
 * a value. The parent then fetches Accounts matching that Industry, passing the
 * selection as a GraphQL variable.
 *
 * LWC equivalent: a child dispatches a CustomEvent via this.dispatchEvent(), and
 * the parent listens with an on<eventname> handler. Angular uses an output() —
 * the same flow with less ceremony.
 *
 * @see StateManagementComponent — sharing state between sibling components
 */
@Component({
	selector: 'app-child-to-parent',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [IndustryPickerComponent],
	templateUrl: './child-to-parent.html',
})
export class ChildToParentComponent {
	protected readonly industry = signal<string | undefined>(undefined);
	protected readonly accounts = signal<string[]>([]);
	protected readonly error = signal<string | undefined>(undefined);
	protected readonly loading = signal(false);

	async onIndustry(industry: string): Promise<void> {
		this.industry.set(industry);
		this.error.set(undefined);
		this.loading.set(true);
		try {
			const sdk = await createDataSDK();
			const result = await sdk.graphql?.query<QueryResponse>({
				query: QUERY,
				variables: { industry },
			});

			if (result?.errors?.length) {
				throw new Error(
					result.errors.map((e: { message: string }) => e.message).join('; '),
				);
			}

			const edges = result?.data?.uiapi?.query?.Account?.edges ?? [];
			this.accounts.set(
				edges
					.map((edge) => edge.node.Name?.value)
					.filter((name): name is string => name != null),
			);
		} catch (err) {
			this.accounts.set([]);
			this.error.set(err instanceof Error ? err.message : 'Request failed');
		} finally {
			this.loading.set(false);
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
