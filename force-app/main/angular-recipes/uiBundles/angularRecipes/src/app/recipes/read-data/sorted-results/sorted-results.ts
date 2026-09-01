import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { createDataSDK } from '@salesforce/platform-sdk';

type SortField = 'Name' | 'Title' | 'Phone';
type SortDir = 'ASC' | 'DESC';

const SORT_FIELDS: { value: SortField; label: string }[] = [
	{ value: 'Name', label: 'Name' },
	{ value: 'Title', label: 'Title' },
	{ value: 'Phone', label: 'Phone' },
];

// orderBy can't be a GraphQL variable in UIAPI, so the field and direction are
// interpolated into the query string, which is rebuilt whenever they change.
// (This one query is a plain string rather than a gql tag for that reason.)
function buildQuery(field: SortField, direction: SortDir): string {
	return `
		query SortedContacts {
			uiapi {
				query {
					Contact(first: 10, orderBy: { ${field}: { order: ${direction} } }) {
						edges {
							node {
								Id
								Name @optional {
									value
								}
								Title @optional {
									value
								}
							}
						}
					}
				}
			}
		}
	`;
}

/**
 * Sorted Results
 *
 * Fetches Contacts with an orderBy driven by component state. Changing the sort
 * field or direction rebuilds and re-runs the query.
 *
 * LWC equivalent: pass a reactive sort property to @wire with the graphql
 * adapter — the wire re-fires when it changes. Here the change handler reloads.
 *
 * @see PaginatedListComponent — cursor-based pagination with Load More
 */
@Component({
	selector: 'app-sorted-results',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './sorted-results.html',
})
export class SortedResultsComponent implements OnInit {
	protected readonly sortFields = SORT_FIELDS;
	protected readonly field = signal<SortField>('Name');
	protected readonly dir = signal<SortDir>('ASC');
	protected readonly contacts = signal<ContactFields[]>([]);
	protected readonly loading = signal(true);
	protected readonly error = signal<string | undefined>(undefined);

	ngOnInit(): void {
		this.load();
	}

	protected onField(value: string): void {
		if (value === 'Name' || value === 'Title' || value === 'Phone') {
			this.field.set(value);
			this.load();
		}
	}

	protected onDir(value: string): void {
		if (value === 'ASC' || value === 'DESC') {
			this.dir.set(value);
			this.load();
		}
	}

	private async load(): Promise<void> {
		this.loading.set(true);
		this.error.set(undefined);
		try {
			const sdk = await createDataSDK();
			const result = await sdk.graphql?.query<SortedContactsResponse>({
				query: buildQuery(this.field(), this.dir()),
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
}

interface SortedContactsResponse {
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
}
