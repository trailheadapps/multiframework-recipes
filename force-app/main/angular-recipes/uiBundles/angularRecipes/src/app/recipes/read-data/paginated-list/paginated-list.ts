import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { createDataSDK, gql } from '@salesforce/platform-sdk';
import { ButtonImports } from '../../../components/ui/button/button';

// $after is an opaque cursor returned by pageInfo.endCursor. Pass it to fetch
// the next page; omit it (or pass null) to start from the beginning.
const QUERY = gql`
	query PaginatedContacts($after: String) {
		uiapi {
			query {
				Contact(first: 2, after: $after, orderBy: { Name: { order: ASC } }) {
					pageInfo {
						hasNextPage
						endCursor
					}
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

/**
 * Paginated List
 *
 * Fetches two Contacts at a time using Relay cursor pagination (first / after).
 * Each "Load More" passes pageInfo.endCursor as $after and appends the next page.
 *
 * LWC equivalent: the @wire graphql adapter paginates with the same cursor
 * pattern — pass endCursor as a reactive variable.
 *
 * @see RelatedRecordsComponent — traversing parent-child relationships
 */
@Component({
	selector: 'app-paginated-list',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ButtonImports],
	templateUrl: './paginated-list.html',
})
export class PaginatedListComponent implements OnInit {
	protected readonly contacts = signal<ContactFields[]>([]);
	protected readonly hasNextPage = signal(false);
	protected readonly loading = signal(true);
	protected readonly loadingMore = signal(false);
	protected readonly error = signal<string | undefined>(undefined);

	// The cursor is plain state, not rendered — a private field, not a signal.
	private endCursor: string | null = null;

	async ngOnInit(): Promise<void> {
		try {
			const page = await this.fetchPage();
			this.contacts.set(page.contacts);
			this.hasNextPage.set(page.hasNextPage);
			this.endCursor = page.endCursor;
		} catch (err) {
			this.error.set(err instanceof Error ? err.message : 'Request failed');
		} finally {
			this.loading.set(false);
		}
	}

	protected async loadMore(): Promise<void> {
		if (!this.endCursor) return;
		this.loadingMore.set(true);
		try {
			const page = await this.fetchPage(this.endCursor);
			// Cursor pagination accumulates — append the new page to the list.
			this.contacts.update((prev) => [...prev, ...page.contacts]);
			this.hasNextPage.set(page.hasNextPage);
			this.endCursor = page.endCursor;
		} catch (err) {
			this.error.set(err instanceof Error ? err.message : 'Request failed');
		} finally {
			this.loadingMore.set(false);
		}
	}

	private async fetchPage(
		after?: string | null,
	): Promise<{ contacts: ContactFields[]; hasNextPage: boolean; endCursor: string | null }> {
		const sdk = await createDataSDK();
		const variables = after ? { after } : {};
		const result = await sdk.graphql?.query<PaginatedContactsResponse>({ query: QUERY, variables });

		if (result?.errors?.length) {
			throw new Error(result.errors.map((e: { message: string }) => e.message).join('; '));
		}

		const connection = result?.data?.uiapi?.query?.Contact;
		const contacts = (connection?.edges ?? [])
			.map((edge) => edge?.node)
			.filter((node): node is ContactNode => node != null)
			.map((node) => ({
				id: node.Id,
				name: node.Name?.value ?? 'Unknown',
				title: node.Title?.value ?? null,
			}));

		return {
			contacts,
			hasNextPage: connection?.pageInfo?.hasNextPage ?? false,
			endCursor: connection?.pageInfo?.endCursor ?? null,
		};
	}
}

interface ContactNode {
	Id: string;
	Name: { value: string | null };
	Title: { value: string | null };
}

interface PaginatedContactsResponse {
	uiapi: {
		query: {
			Contact: {
				pageInfo: { hasNextPage: boolean; endCursor: string | null };
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
