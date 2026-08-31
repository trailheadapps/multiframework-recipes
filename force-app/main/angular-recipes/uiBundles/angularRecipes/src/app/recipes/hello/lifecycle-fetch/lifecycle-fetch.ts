import {
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
	OnInit,
	signal,
} from '@angular/core';
import { createDataSDK, gql } from '@salesforce/platform-sdk';
import { ButtonComponent } from '../../../components/ui/button/button';

const QUERY = gql`
	query FirstContact {
		uiapi {
			query {
				Contact(first: 1, orderBy: { Name: { order: ASC } }) {
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
 * Fetches a Contact when it is created and guards against updates after it is
 * destroyed. `destroyed` is the Angular equivalent of React's stale flag: an
 * in-flight fetch that resolves after ngOnDestroy must not touch signals.
 */
@Component({
	selector: 'app-contact-fetcher',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './contact-fetcher.html',
})
export class ContactFetcherComponent implements OnInit, OnDestroy {
	private destroyed = false;

	protected readonly contact = signal<ContactFields | undefined>(undefined);
	protected readonly loading = signal(true);
	protected readonly error = signal<string | undefined>(undefined);

	async ngOnInit(): Promise<void> {
		try {
			const sdk = await createDataSDK();
			const result = await sdk.graphql?.query<QueryResponse>({ query: QUERY });

			if (this.destroyed) return; // component was destroyed while fetching

			if (result?.errors?.length) {
				throw new Error(
					result.errors.map((e: { message: string }) => e.message).join('; '),
				);
			}

			const node = result?.data?.uiapi?.query?.Contact?.edges?.[0]?.node;
			if (node) {
				this.contact.set({
					name: node.Name?.value ?? 'Unknown',
					title: node.Title?.value ?? null,
				});
			}
		} catch (err) {
			if (!this.destroyed)
				this.error.set(err instanceof Error ? err.message : 'Request failed');
		} finally {
			if (!this.destroyed) this.loading.set(false);
		}
	}

	ngOnDestroy(): void {
		this.destroyed = true;
	}
}

/**
 * Lifecycle: Fetch on Create with Cleanup
 *
 * Toggling the button creates and destroys the child ContactFetcher, which
 * fetches on ngOnInit and guards its state updates in ngOnDestroy.
 *
 * LWC equivalent: connectedCallback fires on insert and disconnectedCallback
 * on removal. ngOnInit / ngOnDestroy serve the same roles — ngOnDestroy is
 * where you cancel in-flight work, like disconnectedCallback.
 *
 * @see BindingAccountNameComponent — querying a single record with GraphQL
 */
@Component({
	selector: 'app-lifecycle-fetch',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ButtonComponent, ContactFetcherComponent],
	templateUrl: './lifecycle-fetch.html',
})
export class LifecycleFetchComponent {
	protected readonly mounted = signal(true);
}

interface QueryResponse {
	uiapi: {
		query: {
			Contact: {
				edges: {
					node: {
						Id: string;
						Name: { value: string | null };
						Title: { value: string | null };
					};
				}[];
			};
		};
	};
}

interface ContactFields {
	name: string;
	title: string | null;
}
