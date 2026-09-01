import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { createDataSDK, gql } from '@salesforce/platform-sdk';

// Aliases (accounts: Account, contacts: Contact) query two objects in one
// round-trip; each alias becomes its own key in the response.
const QUERY = gql`
	query MultiObjectCounts {
		uiapi {
			query {
				# UIAPI has no COUNT() aggregate — edges.length is the workaround.
				# Results are capped at first: 50, so larger sets undercount.
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
			}
		}
	}
`;

/**
 * Aliased Multi-Object Query
 *
 * Queries Accounts and Contacts in a single request using aliases. In LWC you'd
 * need two @wire calls or an Apex method; here aliases combine them into one
 * round-trip, each returning its own connection.
 *
 * @see ImperativeRefetchComponent — re-fetching data on demand
 */
@Component({
	selector: 'app-aliased-multi-object-query',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './aliased-multi-object-query.html',
})
export class AliasedMultiObjectQueryComponent implements OnInit {
	protected readonly counts = signal<Counts | undefined>(undefined);
	protected readonly loading = signal(true);
	protected readonly error = signal<string | undefined>(undefined);

	async ngOnInit(): Promise<void> {
		try {
			const sdk = await createDataSDK();
			const result = await sdk.graphql?.query<QueryResponse>({ query: QUERY });

			if (result?.errors?.length) {
				throw new Error(result.errors.map((e: { message: string }) => e.message).join('; '));
			}

			const query = result?.data?.uiapi?.query;
			this.counts.set({
				accounts: query?.accounts?.edges?.length ?? 0,
				contacts: query?.contacts?.edges?.length ?? 0,
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
		};
	};
}

interface Counts {
	accounts: number;
	contacts: number;
}
