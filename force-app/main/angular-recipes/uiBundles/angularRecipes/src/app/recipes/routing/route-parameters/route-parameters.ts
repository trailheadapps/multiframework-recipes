import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { createDataSDK, gql } from '@salesforce/platform-sdk';

const LIST_QUERY = gql`
	query AccountsForRouting {
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

/**
 * Route Parameters
 *
 * An Account list links to a detail route with a dynamic :accountId segment.
 * The detail component (RouteParametersDetailComponent) reads that param through
 * a signal input() — see withComponentInputBinding() in app.config.ts.
 *
 * LWC equivalent: read the record Id from @wire(CurrentPageReference)
 * pageRef.state.recordId.
 *
 * @see NestedRoutesComponent — a master-detail layout with a persistent sidebar
 */
@Component({
	selector: 'app-route-parameters',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink],
	templateUrl: './route-parameters.html',
})
export class RouteParametersComponent implements OnInit {
	protected readonly accounts = signal<AccountFields[] | undefined>(undefined);
	protected readonly error = signal<string | undefined>(undefined);

	async ngOnInit(): Promise<void> {
		try {
			const sdk = await createDataSDK();
			const result = await sdk.graphql?.query<ListResponse>({ query: LIST_QUERY });
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
		} catch (err) {
			this.error.set(err instanceof Error ? err.message : 'Request failed');
		}
	}
}

interface AccountNode {
	Id: string;
	Name: { value: string | null };
	Industry: { value: string | null };
}

interface ListResponse {
	uiapi: {
		query: {
			Account: {
				edges: { node: AccountNode }[];
			};
		};
	};
}

interface AccountFields {
	id: string;
	name: string;
	industry: string | null;
}
