import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import { createDataSDK, gql } from '@salesforce/platform-sdk';

// The $name variable is supplied at execution time via the `variables` argument.
// UIAPI's `like` operator accepts SQL-style wildcards: %term% matches anywhere.
const QUERY = gql`
	query FilteredContacts($name: String) {
		uiapi {
			query {
				Contact(where: { Name: { like: $name } }, first: 5, orderBy: { Name: { order: ASC } }) {
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
 * Filtered List with Variables
 *
 * Queries Contacts by name using a GraphQL variable bound to an input.
 *
 * LWC equivalent: a @track property bound to an input and passed to @wire —
 * the adapter re-fires when the property changes. Here a debounced handler
 * re-runs the query with a fresh $name variable.
 *
 * @see SortedResultsComponent — sorting results with a dynamic orderBy
 */
@Component({
	selector: 'app-filtered-list',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './filtered-list.html',
})
export class FilteredListComponent implements OnDestroy {
	protected readonly search = signal('');
	protected readonly contacts = signal<ContactFields[]>([]);
	protected readonly loading = signal(false);
	protected readonly error = signal<string | undefined>(undefined);

	private timer?: ReturnType<typeof setTimeout>;

	// Debounce: wait 300ms after the last keystroke before querying. Clearing the
	// pending timer on each keystroke cancels the previous, in-flight request.
	protected onSearch(value: string): void {
		this.search.set(value);
		clearTimeout(this.timer);
		this.error.set(undefined);
		if (!value.trim()) {
			this.contacts.set([]);
			return;
		}
		this.timer = setTimeout(() => this.fetch(value), 300);
	}

	ngOnDestroy(): void {
		clearTimeout(this.timer);
	}

	private async fetch(term: string): Promise<void> {
		this.loading.set(true);
		try {
			const sdk = await createDataSDK();
			const result = await sdk.graphql?.query<FilteredContactsResponse>({
				query: QUERY,
				variables: { name: `%${term}%` },
			});

			if (result?.errors?.length) {
				throw new Error(result.errors.map((e: { message: string }) => e.message).join('; '));
			}

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
		} finally {
			this.loading.set(false);
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

interface FilteredContactsResponse {
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
