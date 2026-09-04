import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { createDataSDK, gql } from '@salesforce/platform-sdk';
import { ButtonImports } from '../../../components/ui/button/button';

const QUERY = gql`
	query RefetchContacts {
		uiapi {
			query {
				Contact(first: 5, orderBy: { Name: { order: ASC } }) {
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
 * Imperative Refetch
 *
 * Displays a Contact list with a Refresh button that re-runs the query on
 * demand.
 *
 * LWC equivalent: refreshApex() or notifyRecordUpdateAvailable() to force a
 * @wire adapter to re-fetch. Here there is no cache to invalidate — you simply
 * call the fetch method again.
 *
 * @see The Modify Data recipes — after a create/update/delete you call the
 * fetch method again to reload, the same pattern shown here.
 */
@Component({
	selector: 'app-imperative-refetch',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ButtonImports],
	templateUrl: './imperative-refetch.html',
})
export class ImperativeRefetchComponent implements OnInit {
	protected readonly contacts = signal<ContactFields[]>([]);
	protected readonly loading = signal(true);
	protected readonly error = signal<string | undefined>(undefined);
	protected readonly fetchCount = signal(0);

	ngOnInit(): void {
		this.refetch();
	}

	protected async refetch(): Promise<void> {
		this.loading.set(true);
		this.error.set(undefined);
		try {
			const sdk = await createDataSDK();
			const result = await sdk.graphql?.query<QueryResponse>({ query: QUERY });

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
			this.fetchCount.update((n) => n + 1);
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

interface QueryResponse {
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
