import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { createDataSDK, gql } from '@salesforce/platform-sdk';
import { ButtonImports } from '../../../components/ui/button/button';
import { InputImports } from '../../../components/ui/input/input';
import { SelectImports } from '../../../components/ui/select/select';
import { FieldImports } from '../../../components/ui/field/field';

// Read: load one Account to populate the form.
const LOAD_QUERY = gql`
	query FirstAccount {
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
						}
					}
				}
			}
		}
	}
`;

// Write: update Name and Industry. Id is a top-level field on the input, not
// nested inside Account.
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
 * Update a Record
 *
 * Loads an Account and edits Name and Industry via the AccountUpdate mutation.
 *
 * LWC equivalent: updateRecord() auto-notifies @wire adapters. The SDK mutate
 * has no cache to invalidate — sync local signals from the server response.
 *
 * @see DeleteRecordComponent — removing records with a confirmation pattern
 */
@Component({
	selector: 'app-update-record',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ButtonImports, InputImports, SelectImports, FieldImports],
	templateUrl: './update-record.html',
})
export class UpdateRecordComponent implements OnInit {
	// app-select wants { value, label } pairs; the empty value reads as "— None —".
	protected readonly industryOptions = INDUSTRY_OPTIONS.map((o) => ({
		value: o,
		label: o || '— None —',
	}));
	protected readonly accountId = signal<string | undefined>(undefined);
	protected readonly name = signal('');
	protected readonly industry = signal('');
	protected readonly loading = signal(true);
	protected readonly submitting = signal(false);
	protected readonly success = signal(false);
	protected readonly error = signal<string | undefined>(undefined);

	async ngOnInit(): Promise<void> {
		try {
			const sdk = await createDataSDK();
			const res = await sdk.graphql?.query<LoadResponse>({ query: LOAD_QUERY });
			if (res?.errors?.length) {
				throw new Error(res.errors.map((e: { message: string }) => e.message).join('; '));
			}
			const node = res?.data?.uiapi?.query?.Account?.edges?.[0]?.node;
			if (node) {
				this.accountId.set(node.Id);
				this.name.set(node.Name?.value ?? '');
				this.industry.set(node.Industry?.value ?? '');
			}
		} catch (err) {
			this.error.set(err instanceof Error ? err.message : 'Request failed');
		} finally {
			this.loading.set(false);
		}
	}

	protected async onSubmit(event: Event): Promise<void> {
		event.preventDefault();
		const id = this.accountId();
		if (!id) return;
		this.submitting.set(true);
		this.success.set(false);
		this.error.set(undefined);
		try {
			const sdk = await createDataSDK();
			const res = await sdk.graphql?.mutate<UpdateResponse>({
				mutation: UPDATE_MUTATION,
				variables: { input: { Id: id, Account: { Name: this.name(), Industry: this.industry() } } },
			});

			if (res?.errors?.length) {
				throw new Error(res.errors.map((e: { message: string }) => e.message).join('; '));
			}

			const record = res?.data?.uiapi?.AccountUpdate?.Record;
			if (!record) {
				throw new Error('No record returned from AccountUpdate');
			}
			// Sync local signals with the values returned by the server.
			this.name.set(record.Name?.value ?? '');
			this.industry.set(record.Industry?.value ?? '');
			this.success.set(true);
		} catch (err) {
			this.error.set(err instanceof Error ? err.message : 'Request failed');
		} finally {
			this.submitting.set(false);
		}
	}
}

interface LoadResponse {
	uiapi: {
		query: {
			Account: {
				edges: {
					node: { Id: string; Name: { value: string | null }; Industry: { value: string | null } };
				}[];
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
