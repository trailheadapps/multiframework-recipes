import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	computed,
	input,
	output,
	signal,
} from '@angular/core';
import { createDataSDK, gql } from '@salesforce/platform-sdk';
import { ButtonComponent } from '../../../components/ui/button/button';

const QUERY = gql`
	query AccountsForSelection {
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

/** Sibling 1: lists the Accounts and emits the one the user picks. */
@Component({
	selector: 'app-account-selector',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ButtonComponent],
	templateUrl: './account-selector.html',
})
export class AccountSelectorComponent {
	readonly accounts = input.required<AccountFields[]>();
	readonly selectedId = input<string | undefined>(undefined);
	readonly accountSelected = output<string>();
}

/** Sibling 2: displays whichever Account the parent hands it. */
@Component({
	selector: 'app-account-detail',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './account-detail.html',
})
export class AccountDetailComponent {
	readonly account = input<AccountFields | undefined>(undefined);
}

/**
 * State Management (Lifting State Up)
 *
 * Two sibling components share a selected Account by lifting state to their
 * common parent: one sibling selects, the other displays.
 *
 * LWC equivalent: sibling communication uses Lightning Message Service or a
 * shared pub/sub module. In Angular, the idiomatic answer is to lift the state
 * to the nearest common ancestor — here a signal the parent owns.
 *
 * @see LifecycleFetchComponent — cleanup patterns for async work
 */
@Component({
	selector: 'app-state-management',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [AccountSelectorComponent, AccountDetailComponent],
	templateUrl: './state-management.html',
})
export class StateManagementComponent implements OnInit {
	protected readonly accounts = signal<AccountFields[]>([]);
	protected readonly selectedId = signal<string | undefined>(undefined);
	protected readonly error = signal<string | undefined>(undefined);

	protected readonly selected = computed(() =>
		this.accounts().find((a) => a.id === this.selectedId()),
	);

	async ngOnInit(): Promise<void> {
		try {
			const sdk = await createDataSDK();
			const result = await sdk.graphql?.query<QueryResponse>({ query: QUERY });

			if (result?.errors?.length) {
				throw new Error(
					result.errors.map((e: { message: string }) => e.message).join('; '),
				);
			}

			const edges = result?.data?.uiapi?.query?.Account?.edges ?? [];
			this.accounts.set(
				edges.map((edge) => ({
					id: edge.node.Id,
					name: edge.node.Name?.value ?? 'Unknown',
					industry: edge.node.Industry?.value ?? null,
				})),
			);
		} catch (err) {
			this.error.set(err instanceof Error ? err.message : 'Request failed');
		}
	}
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
					};
				}[];
			};
		};
	};
}

interface AccountFields {
	id: string;
	name: string;
	industry: string | null;
}
