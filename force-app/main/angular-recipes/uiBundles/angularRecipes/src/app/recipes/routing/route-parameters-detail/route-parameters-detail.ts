import { ChangeDetectionStrategy, Component, effect, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { createDataSDK, gql } from '@salesforce/platform-sdk';

const DETAIL_QUERY = gql`
	query AccountById($id: ID) {
		uiapi {
			query {
				Account(where: { Id: { eq: $id } }, first: 1) {
					edges {
						node {
							Id
							Name @optional {
								value
							}
							Industry @optional {
								value
							}
							Phone @optional {
								value
							}
							Website @optional {
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
 * Route Parameters — detail route
 *
 * Rendered at /routing/route-parameters/:accountId. The route param binds to the
 * `accountId` signal input (withComponentInputBinding in app.config.ts), and an
 * effect re-fetches whenever it changes — the Angular equivalent of React
 * Router's useParams() + a keyed useEffect.
 */
@Component({
	selector: 'app-route-parameters-detail',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink],
	templateUrl: './route-parameters-detail.html',
})
export class RouteParametersDetailComponent {
	readonly accountId = input<string>();

	protected readonly account = signal<AccountDetail | undefined>(undefined);
	protected readonly loading = signal(true);
	protected readonly error = signal<string | undefined>(undefined);

	constructor() {
		effect(() => {
			const id = this.accountId();
			if (id) this.load(id);
		});
	}

	private async load(id: string): Promise<void> {
		this.loading.set(true);
		this.error.set(undefined);
		try {
			const sdk = await createDataSDK();
			const result = await sdk.graphql?.query<DetailResponse>({
				query: DETAIL_QUERY,
				variables: { id },
			});
			if (result?.errors?.length) {
				throw new Error(result.errors.map((e: { message: string }) => e.message).join('; '));
			}
			const node = result?.data?.uiapi?.query?.Account?.edges?.[0]?.node;
			this.account.set(
				node
					? {
							name: node.Name?.value ?? 'Unknown',
							industry: node.Industry?.value ?? null,
							phone: node.Phone?.value ?? null,
							website: node.Website?.value ?? null,
						}
					: undefined,
			);
		} catch (err) {
			this.error.set(err instanceof Error ? err.message : 'Request failed');
		} finally {
			this.loading.set(false);
		}
	}
}

interface DetailResponse {
	uiapi: {
		query: {
			Account: {
				edges: {
					node: {
						Id: string;
						Name: { value: string | null };
						Industry: { value: string | null };
						Phone: { value: string | null };
						Website: { value: string | null };
					};
				}[];
			};
		};
	};
}

interface AccountDetail {
	name: string;
	industry: string | null;
	phone: string | null;
	website: string | null;
}
