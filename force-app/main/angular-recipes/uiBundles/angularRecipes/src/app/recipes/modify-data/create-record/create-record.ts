import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { createDataSDK, gql } from '@salesforce/platform-sdk';
import { ButtonImports } from '../../../components/ui/button/button';
import { InputImports } from '../../../components/ui/input/input';
import { FieldImports } from '../../../components/ui/field/field';

// UIAPI mutations follow uiapi.<Object>Create / Update / Delete. The input type
// is <Object>CreateInput and the response nests under uiapi.<Object>Create.Record
// with the same { value } scalar wrappers as queries.
const CREATE_ACCOUNT = gql`
	mutation CreateAccount($input: AccountCreateInput!) {
		uiapi {
			AccountCreate(input: $input) {
				Record {
					Id
					Name {
						value
					}
				}
			}
		}
	}
`;

/**
 * Create a Record
 *
 * Creates an Account via the AccountCreate UIAPI mutation on form submit. The
 * response returns the new record's Id and Name.
 *
 * LWC equivalent: createRecord() from lightning/uiRecordApi with an apiName and
 * fields object; here the mutation names the object and fields explicitly.
 *
 * @see UpdateRecordComponent — editing an existing record
 */
@Component({
	selector: 'app-create-record',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ButtonImports, InputImports, FieldImports],
	templateUrl: './create-record.html',
})
export class CreateRecordComponent {
	protected readonly name = signal('');
	protected readonly submitting = signal(false);
	protected readonly result = signal<{ id: string; name: string | null } | undefined>(undefined);
	protected readonly error = signal<string | undefined>(undefined);

	protected async onSubmit(event: Event): Promise<void> {
		event.preventDefault();
		if (!this.name().trim()) return;
		this.submitting.set(true);
		this.error.set(undefined);
		this.result.set(undefined);
		try {
			const sdk = await createDataSDK();
			const res = await sdk.graphql?.mutate<CreateAccountResponse>({
				mutation: CREATE_ACCOUNT,
				variables: { input: { Account: { Name: this.name().trim() } } },
			});

			if (res?.errors?.length) {
				throw new Error(res.errors.map((e: { message: string }) => e.message).join('; '));
			}

			const record = res?.data?.uiapi?.AccountCreate?.Record;
			if (!record) {
				throw new Error('No record returned from AccountCreate');
			}
			this.result.set({ id: record.Id, name: record.Name?.value ?? null });
		} catch (err) {
			this.error.set(err instanceof Error ? err.message : 'Request failed');
		} finally {
			this.submitting.set(false);
		}
	}

	protected reset(): void {
		this.name.set('');
		this.result.set(undefined);
		this.error.set(undefined);
	}
}

interface CreateAccountResponse {
	uiapi: {
		AccountCreate: {
			Record: { Id: string; Name: { value: string | null } | null } | null;
		};
	};
}
