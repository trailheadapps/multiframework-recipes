import { Injectable, signal } from '@angular/core';
import { createDataSDK, gql } from '@salesforce/platform-sdk';

const QUERY = gql`
	query AccountsForNesting {
		uiapi {
			query {
				Account(first: 5, orderBy: { Name: { order: ASC } }) {
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

export interface NestedAccount {
	id: string;
	name: string;
	industry: string | null;
}

/**
 * Route-scoped store shared by the Nested Routes layout and its child routes.
 * Angular has no useOutletContext; providing this on the route (see app.routes.ts)
 * gives the layout and its `:accountId` child one shared, already-loaded list —
 * so the child never re-fetches.
 */
@Injectable()
export class NestedRoutesStore {
	readonly accounts = signal<NestedAccount[]>([]);
	readonly error = signal<string | undefined>(undefined);
	readonly loaded = signal(false);

	private loading = false;

	async load(): Promise<void> {
		if (this.loaded() || this.loading) return;
		this.loading = true;
		try {
			const sdk = await createDataSDK();
			const result = await sdk.graphql?.query<QueryResponse>({ query: QUERY });
			if (result?.errors?.length) {
				throw new Error(result.errors.map((e: { message: string }) => e.message).join('; '));
			}
			this.accounts.set(
				(result?.data?.uiapi?.query?.Account?.edges ?? [])
					.map((edge) => edge?.node)
					.filter((node): node is AccountNode => node != null)
					.map((node) => ({
						id: node.Id,
						name: node.Name?.value ?? 'Unknown',
						industry: node.Industry?.value ?? null,
					})),
			);
			this.loaded.set(true);
		} catch (err) {
			this.error.set(err instanceof Error ? err.message : 'Request failed');
		} finally {
			this.loading = false;
		}
	}

	find(id: string): NestedAccount | undefined {
		return this.accounts().find((a) => a.id === id);
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
