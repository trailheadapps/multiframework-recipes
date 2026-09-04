import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import { createDataSDK, gql } from '@salesforce/platform-sdk';
import { ButtonImports } from '../../../components/ui/button/button';
import { SkeletonComponent } from '../../../components/recipe/skeleton/skeleton';

const QUERY = gql`
	query ContactsWithPicture {
		uiapi {
			query {
				Contact(where: { Picture__c: { ne: null } }, first: 3, orderBy: { Name: { order: ASC } }) {
					edges {
						node {
							Id
							Name @optional {
								value
							}
							Phone @optional {
								value
							}
							Picture__c @optional {
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

// A discriminated union makes the four states mutually exclusive — you can't
// accidentally render data while still "loading". This is the type-level
// equivalent of LWC's if:true={data} / if:true={error} template guards.
type AsyncState =
	| { status: 'loading' }
	| { status: 'error'; message: string }
	| { status: 'empty' }
	| { status: 'data'; contacts: ContactFields[] };

/**
 * Loading, Error, and Empty States
 *
 * Every async component must handle loading, error, and empty states
 * explicitly. In LWC @wire hands you data and error automatically; here you own
 * all four as a discriminated-union state machine held in a signal. The
 * simulate buttons force each state on demand.
 *
 * @see GraphqlErrorsComponent — inspecting GraphQL error objects
 */
@Component({
	selector: 'app-loading-error-empty',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ButtonImports, SkeletonComponent],
	templateUrl: './loading-error-empty.html',
})
export class LoadingErrorEmptyComponent implements OnInit {
	protected readonly state = signal<AsyncState>({ status: 'loading' });

	// Computed accessors narrow the union in TypeScript so the template stays
	// cast-free while still reacting to state changes.
	protected readonly errorMessage = computed(() => {
		const s = this.state();
		return s.status === 'error' ? s.message : '';
	});
	protected readonly contacts = computed(() => {
		const s = this.state();
		return s.status === 'data' ? s.contacts : [];
	});

	ngOnInit(): void {
		this.fetch();
	}

	protected load(): void {
		this.state.set({ status: 'loading' });
		this.fetch();
	}

	protected simulateLoading(): void {
		this.state.set({ status: 'loading' });
	}

	protected simulateError(): void {
		this.state.set({ status: 'error', message: 'Network request failed' });
	}

	protected simulateEmpty(): void {
		this.state.set({ status: 'empty' });
	}

	private async fetch(): Promise<void> {
		try {
			const sdk = await createDataSDK();
			const result = await sdk.graphql?.query<QueryResponse>({ query: QUERY });

			if (result?.errors?.length) {
				throw new Error(result.errors.map((e: { message: string }) => e.message).join('; '));
			}

			const contacts = (result?.data?.uiapi?.query?.Contact?.edges ?? [])
				.map((edge) => edge?.node)
				.filter((node): node is ContactNode => node != null)
				.map((node) => ({
					id: node.Id,
					name: node.Name?.value ?? 'Unknown',
					phone: node.Phone?.value ?? null,
					picture: node.Picture__c?.value ?? null,
					title: node.Title?.value ?? null,
				}));

			this.state.set(contacts.length ? { status: 'data', contacts } : { status: 'empty' });
		} catch (err) {
			this.state.set({
				status: 'error',
				message: err instanceof Error ? err.message : 'Request failed',
			});
		}
	}
}

interface ContactNode {
	Id: string;
	Name: { value: string | null } | null;
	Phone: { value: string | null } | null;
	Picture__c: { value: string | null } | null;
	Title: { value: string | null } | null;
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
	phone: string | null;
	picture: string | null;
	title: string | null;
}
