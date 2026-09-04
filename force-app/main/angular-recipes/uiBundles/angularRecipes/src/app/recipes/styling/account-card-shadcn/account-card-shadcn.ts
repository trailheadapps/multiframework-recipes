import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { createDataSDK, gql } from '@salesforce/platform-sdk';
import { CardImports } from '../../../components/ui/card/card';

const QUERY = gql`
	query GetFirstAccount {
		uiapi {
			query {
				Account(first: 1) {
					edges {
						node {
							Id
							Name @optional {
								value
							}
							Industry @optional {
								value
							}
							AnnualRevenue @optional {
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
 * Account Card — spartan-ng
 *
 * The same Account data rendered with the app's spartan-ng card components
 * (Tailwind + helm) — the Angular counterpart of shadcn/ui, for custom UIs that
 * don't need the Salesforce look and feel.
 *
 * @see AccountCardSldsComponent — the same card with SLDS blueprint classes
 */
@Component({
	selector: 'app-account-card-shadcn',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CardImports],
	templateUrl: './account-card-shadcn.html',
})
export class AccountCardShadcnComponent implements OnInit {
	protected readonly account = signal<AccountFields | undefined>(undefined);
	protected readonly loading = signal(true);
	protected readonly error = signal<string | undefined>(undefined);

	async ngOnInit(): Promise<void> {
		try {
			const sdk = await createDataSDK();
			const result = await sdk.graphql?.query<QueryResponse>({ query: QUERY });

			if (result?.errors?.length) {
				throw new Error(result.errors.map((e: { message: string }) => e.message).join('; '));
			}

			const node = result?.data?.uiapi?.query?.Account?.edges?.[0]?.node;
			if (node) {
				this.account.set({
					name: node.Name?.value ?? 'Unknown',
					industry: node.Industry?.value ?? null,
					revenue: formatRevenue(node.AnnualRevenue?.value),
				});
			}
		} catch (err) {
			this.error.set(err instanceof Error ? err.message : 'Request failed');
		} finally {
			this.loading.set(false);
		}
	}
}

function formatRevenue(value: number | null | undefined): string {
	if (value == null) return '—';
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		notation: 'compact',
		maximumFractionDigits: 1,
	}).format(value);
}

interface QueryResponse {
	uiapi: {
		query: {
			Account: {
				edges: {
					node: {
						Id: string;
						Name: { value: string | null };
						Industry: { value: string | null };
						AnnualRevenue: { value: number | null };
					};
				}[];
			};
		};
	};
}

interface AccountFields {
	name: string;
	industry: string | null;
	revenue: string;
}
