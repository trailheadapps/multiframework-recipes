import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import { createDataSDK, gql } from '@salesforce/platform-sdk';
import { StatCardComponent } from '../../../components/recipe/stat-card/stat-card';

// Three aliases in one request — each becomes its own key in the response,
// so a whole dashboard's counts come back in a single round-trip.
const QUERY = gql`
	query DashboardCounts {
		uiapi {
			query {
				accounts: Account(first: 50) {
					edges {
						node {
							Id
						}
					}
				}
				contacts: Contact(first: 50) {
					edges {
						node {
							Id
						}
					}
				}
				opportunities: Opportunity(first: 50) {
					edges {
						node {
							Id
						}
					}
				}
			}
		}
	}
`;

/**
 * Dashboard with Aliased Queries
 *
 * Fetches Accounts, Contacts, and Opportunities in a single aliased request and
 * transforms the results into stat cards — the dashboard pattern built on the
 * aliased multi-object query.
 *
 * LWC equivalent: multiple @wire calls, or an Apex method returning a wrapper
 * with a count per object.
 */
@Component({
	selector: 'app-dashboard-aliased-queries',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [StatCardComponent],
	templateUrl: './dashboard-aliased-queries.html',
})
export class DashboardAliasedQueriesComponent implements OnInit {
	protected readonly stats = signal<DashboardStats | undefined>(undefined);
	protected readonly loading = signal(true);
	protected readonly error = signal<string | undefined>(undefined);

	// One card descriptor per object — the template loops over these instead of
	// repeating the card markup three times.
	protected readonly cards = computed(() => {
		const s = this.stats();
		if (!s) return [];
		return [
			{ label: 'Accounts', count: s.accounts, accent: 'border-l-primary' },
			{ label: 'Contacts', count: s.contacts, accent: 'border-l-rose-400' },
			{ label: 'Opportunities', count: s.opportunities, accent: 'border-l-amber-400' },
		];
	});

	async ngOnInit(): Promise<void> {
		try {
			const sdk = await createDataSDK();
			const result = await sdk.graphql?.query<QueryResponse>({ query: QUERY });

			if (result?.errors?.length) {
				throw new Error(result.errors.map((e: { message: string }) => e.message).join('; '));
			}

			const query = result?.data?.uiapi?.query;
			this.stats.set({
				accounts: query?.accounts?.edges?.length ?? 0,
				contacts: query?.contacts?.edges?.length ?? 0,
				opportunities: query?.opportunities?.edges?.length ?? 0,
			});
		} catch (err) {
			this.error.set(err instanceof Error ? err.message : 'Request failed');
		} finally {
			this.loading.set(false);
		}
	}
}

interface QueryResponse {
	uiapi: {
		query: {
			accounts: { edges: { node: { Id: string } }[] };
			contacts: { edges: { node: { Id: string } }[] };
			opportunities: { edges: { node: { Id: string } }[] };
		};
	};
}

interface DashboardStats {
	accounts: number;
	contacts: number;
	opportunities: number;
}
