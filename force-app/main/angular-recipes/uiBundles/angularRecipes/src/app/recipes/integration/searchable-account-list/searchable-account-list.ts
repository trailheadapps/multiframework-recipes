import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { createDataSDK, gql } from '@salesforce/platform-sdk';
import { InputImports } from '../../../components/ui/input/input';

// The $name variable drives the `like` filter; the "%%" default matches all,
// so the list is fully populated on first load before the user types.
const QUERY = gql`
	query SearchAccounts($name: String = "%%") {
		uiapi {
			query {
				Account(first: 10, where: { Name: { like: $name } }, orderBy: { Name: { order: ASC } }) {
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
 * Searchable Account List
 *
 * A controlled, debounced search input drives a GraphQL variable that filters
 * Accounts by name — combining variables, imperative refetch, loading states,
 * and debounce in one cohesive pattern.
 *
 * LWC equivalent: a @track property with a debounce timer passed to @wire; the
 * wire re-fires when the variable changes.
 *
 * @see DashboardAliasedQueriesComponent — aliased queries for a dashboard
 */
@Component({
	selector: 'app-searchable-account-list',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [InputImports],
	templateUrl: './searchable-account-list.html',
})
export class SearchableAccountListComponent implements OnInit, OnDestroy {
	protected readonly search = signal('');
	protected readonly accounts = signal<AccountFields[]>([]);
	protected readonly loading = signal(true);
	protected readonly error = signal<string | undefined>(undefined);

	private timer?: ReturnType<typeof setTimeout>;
	// Monotonic id so a slow earlier request can't overwrite a newer one — the
	// mount fetch('') and a debounced fetch(term) can be in flight at once.
	private requestId = 0;

	ngOnInit(): void {
		this.fetch('');
	}

	protected onSearch(value: string): void {
		this.search.set(value);
		clearTimeout(this.timer);
		this.timer = setTimeout(() => this.fetch(value), 350);
	}

	ngOnDestroy(): void {
		clearTimeout(this.timer);
	}

	private async fetch(term: string): Promise<void> {
		const id = ++this.requestId;
		this.loading.set(true);
		this.error.set(undefined);
		try {
			const sdk = await createDataSDK();
			const result = await sdk.graphql?.query<QueryResponse>({
				query: QUERY,
				variables: { name: term ? `%${term}%` : '%%' },
			});

			// A newer search started while this one was in flight — drop the stale result.
			if (id !== this.requestId) return;

			if (result?.errors?.length) {
				throw new Error(result.errors.map((e: { message: string }) => e.message).join('; '));
			}

			const edges = result?.data?.uiapi?.query?.Account?.edges ?? [];
			this.accounts.set(
				edges
					.map((edge) => edge?.node)
					.filter((node): node is AccountNode => node != null)
					.map((node) => ({
						id: node.Id,
						name: node.Name?.value ?? 'Unknown',
						industry: node.Industry?.value ?? null,
					})),
			);
		} catch (err) {
			if (id !== this.requestId) return;
			this.error.set(err instanceof Error ? err.message : 'Request failed');
		} finally {
			if (id === this.requestId) this.loading.set(false);
		}
	}
}

interface AccountNode {
	Id: string;
	Name: { value: string | null };
	Industry: { value: string | null };
}

interface QueryResponse {
	uiapi: {
		query: {
			Account: {
				edges: { node: AccountNode }[];
			};
		};
	};
}

interface AccountFields {
	id: string;
	name: string;
	industry: string | null;
}
