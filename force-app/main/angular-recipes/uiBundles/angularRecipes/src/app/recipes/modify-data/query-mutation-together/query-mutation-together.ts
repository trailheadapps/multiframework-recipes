import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { createDataSDK, gql } from '@salesforce/platform-sdk';
import { ButtonImports } from '../../../components/ui/button/button';
import { InputImports } from '../../../components/ui/input/input';
import { SelectImports } from '../../../components/ui/select/select';

// Read: load Accounts.
const LIST_QUERY = gql`
	query AccountsForEditing {
		uiapi {
			query {
				Account(first: 10, orderBy: { Name: { order: ASC } }) {
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

// Write: update Name and Industry.
const UPDATE_MUTATION = gql`
	mutation UpdateAccount($input: AccountUpdateInput!) {
		uiapi {
			AccountUpdate(input: $input) {
				Record {
					Id
					Name {
						value
					}
					Industry {
						value
					}
				}
			}
		}
	}
`;

const INDUSTRY_OPTIONS = [
	'',
	'Agriculture',
	'Apparel',
	'Banking',
	'Biotechnology',
	'Chemicals',
	'Communications',
	'Construction',
	'Consulting',
	'Education',
	'Electronics',
	'Energy',
	'Engineering',
	'Entertainment',
	'Finance',
	'Government',
	'Healthcare',
	'Hospitality',
	'Insurance',
	'Manufacturing',
	'Media',
	'Not For Profit',
	'Retail',
	'Technology',
	'Telecommunications',
	'Transportation',
	'Utilities',
	'Other',
];

/**
 * Query + Mutation Together
 *
 * Lists Accounts with inline editing: a query populates the table, an inline
 * form edits one row, AccountUpdate saves it, and the server response patches
 * that row in local state — no full re-fetch.
 *
 * LWC equivalent: @wire populates the list and updateRecord() auto-refreshes;
 * here local state is synced manually from the mutation response.
 *
 * @see ServerErrorHandlingComponent — handling mutation errors from the server
 */
@Component({
	selector: 'app-query-mutation-together',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ButtonImports, InputImports, SelectImports],
	templateUrl: './query-mutation-together.html',
})
export class QueryMutationTogetherComponent implements OnInit {
	// app-select wants { value, label } pairs; the empty value reads as "— None —".
	protected readonly industryOptions = INDUSTRY_OPTIONS.map((o) => ({
		value: o,
		label: o || '— None —',
	}));
	protected readonly accounts = signal<AccountRow[]>([]);
	protected readonly loading = signal(true);
	protected readonly error = signal<string | undefined>(undefined);

	// Inline edit state.
	protected readonly editId = signal<string | undefined>(undefined);
	protected readonly editName = signal('');
	protected readonly editIndustry = signal('');
	protected readonly saving = signal(false);
	protected readonly saveError = signal<string | undefined>(undefined);

	async ngOnInit(): Promise<void> {
		try {
			const sdk = await createDataSDK();
			const res = await sdk.graphql?.query<ListResponse>({ query: LIST_QUERY });
			if (res?.errors?.length) {
				throw new Error(res.errors.map((e: { message: string }) => e.message).join('; '));
			}
			this.accounts.set(
				(res?.data?.uiapi?.query?.Account?.edges ?? [])
					.map((edge) => edge?.node)
					.filter((node): node is AccountNode => node != null)
					.map((node) => ({
						id: node.Id,
						name: node.Name?.value ?? '',
						industry: node.Industry?.value ?? '',
					})),
			);
		} catch (err) {
			this.error.set(err instanceof Error ? err.message : 'Request failed');
		} finally {
			this.loading.set(false);
		}
	}

	protected startEdit(account: AccountRow): void {
		this.editId.set(account.id);
		this.editName.set(account.name);
		this.editIndustry.set(account.industry);
		this.saveError.set(undefined);
	}

	protected cancelEdit(): void {
		this.editId.set(undefined);
		this.saveError.set(undefined);
	}

	protected async handleSave(event: Event): Promise<void> {
		event.preventDefault();
		const id = this.editId();
		if (!id || !this.editName().trim()) return;
		this.saving.set(true);
		this.saveError.set(undefined);
		try {
			const sdk = await createDataSDK();
			const res = await sdk.graphql?.mutate<UpdateResponse>({
				mutation: UPDATE_MUTATION,
				variables: { input: { Id: id, Account: { Name: this.editName(), Industry: this.editIndustry() } } },
			});

			if (res?.errors?.length) {
				throw new Error(res.errors.map((e: { message: string }) => e.message).join('; '));
			}

			const record = res?.data?.uiapi?.AccountUpdate?.Record;
			if (!record) {
				throw new Error('No record returned from AccountUpdate');
			}

			// Patch just the edited row from the server response — no re-fetch.
			this.accounts.update((prev) =>
				prev.map((a) =>
					a.id === id
						? { id, name: record.Name?.value ?? '', industry: record.Industry?.value ?? '' }
						: a,
				),
			);
			this.editId.set(undefined);
		} catch (err) {
			this.saveError.set(err instanceof Error ? err.message : 'Request failed');
		} finally {
			this.saving.set(false);
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

interface UpdateResponse {
	uiapi: {
		AccountUpdate: {
			Record: {
				Id: string;
				Name: { value: string | null } | null;
				Industry: { value: string | null } | null;
			} | null;
		};
	};
}

interface AccountRow {
	id: string;
	name: string;
	industry: string;
}
