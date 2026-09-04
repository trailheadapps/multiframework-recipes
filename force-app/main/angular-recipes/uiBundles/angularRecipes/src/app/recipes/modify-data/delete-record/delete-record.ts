import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { createDataSDK, gql } from '@salesforce/platform-sdk';
import { ButtonImports } from '../../../components/ui/button/button';

// Read: load Accounts to display.
const LIST_QUERY = gql`
	query AccountsForDelete {
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

// Write: delete by Id. The input type is the generic RecordDeleteInput, not
// AccountDeleteInput.
const DELETE_MUTATION = gql`
	mutation DeleteAccount($input: RecordDeleteInput!) {
		uiapi {
			AccountDelete(input: $input) {
				Id
			}
		}
	}
`;

/**
 * Delete a Record
 *
 * Lists Accounts with a per-row confirm; confirming calls AccountDelete and
 * removes the row from local state — no re-fetch.
 *
 * LWC equivalent: deleteRecord() auto-updates @wire adapters; here you remove
 * the row from local state manually.
 *
 * @see QueryMutationTogetherComponent — inline editing with read-then-write
 */
@Component({
	selector: 'app-delete-record',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ButtonImports],
	templateUrl: './delete-record.html',
})
export class DeleteRecordComponent implements OnInit {
	protected readonly accounts = signal<AccountRow[]>([]);
	protected readonly loading = signal(true);
	protected readonly error = signal<string | undefined>(undefined);
	// Which row is asking "Are you sure?" and which is mid-delete.
	protected readonly confirmId = signal<string | undefined>(undefined);
	protected readonly deletingId = signal<string | undefined>(undefined);

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
						name: node.Name?.value ?? 'Unknown',
						industry: node.Industry?.value ?? null,
					})),
			);
		} catch (err) {
			this.error.set(err instanceof Error ? err.message : 'Request failed');
		} finally {
			this.loading.set(false);
		}
	}

	protected confirm(id: string): void {
		this.confirmId.set(id);
	}

	protected cancel(): void {
		this.confirmId.set(undefined);
	}

	protected async handleDelete(id: string): Promise<void> {
		this.confirmId.set(undefined);
		this.deletingId.set(id);
		try {
			const sdk = await createDataSDK();
			const res = await sdk.graphql?.mutate<DeleteResponse>({
				mutation: DELETE_MUTATION,
				variables: { input: { Id: id } },
			});
			if (res?.errors?.length) {
				throw new Error(res.errors.map((e: { message: string }) => e.message).join('; '));
			}
			// Remove the deleted row from local state — no re-fetch needed.
			this.accounts.update((prev) => prev.filter((a) => a.id !== id));
		} catch (err) {
			this.error.set(err instanceof Error ? err.message : 'Request failed');
		} finally {
			this.deletingId.set(undefined);
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

interface DeleteResponse {
	uiapi: {
		AccountDelete: { Id: string } | null;
	};
}

interface AccountRow {
	id: string;
	name: string;
	industry: string | null;
}
