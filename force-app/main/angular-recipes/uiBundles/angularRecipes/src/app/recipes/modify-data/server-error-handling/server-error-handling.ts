import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { createDataSDK, gql } from '@salesforce/platform-sdk';
import { ButtonImports } from '../../../components/ui/button/button';
import { InputImports } from '../../../components/ui/input/input';
import { FieldImports } from '../../../components/ui/field/field';

const CREATE_CONTACT = gql`
	mutation CreateContact($input: ContactCreateInput!) {
		uiapi {
			ContactCreate(input: $input) {
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
 * Server-Side Error Handling
 *
 * The form intentionally omits the required LastName field, so submitting a
 * ContactCreate returns a top-level GraphQL error. These live in result.errors[]
 * (operation-level), not as thrown exceptions — read them off the result.
 *
 * LWC equivalent: createRecord() rejects with body.message and
 * body.output.fieldErrors for field-level detail.
 *
 * @see LoadingErrorEmptyComponent — loading/error/empty UI states
 */
@Component({
	selector: 'app-server-error-handling',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ButtonImports, InputImports, FieldImports],
	templateUrl: './server-error-handling.html',
})
export class ServerErrorHandlingComponent {
	protected readonly email = signal('');
	protected readonly phone = signal('');
	protected readonly submitting = signal(false);
	protected readonly topLevelError = signal<string | undefined>(undefined);
	protected readonly createdId = signal<string | undefined>(undefined);

	protected async onSubmit(event: Event): Promise<void> {
		event.preventDefault();
		this.submitting.set(true);
		this.topLevelError.set(undefined);
		this.createdId.set(undefined);
		try {
			const sdk = await createDataSDK();
			const result = await sdk.graphql?.mutate<ContactCreateResult>({
				mutation: CREATE_CONTACT,
				variables: {
					input: {
						// LastName is required by Salesforce but intentionally omitted,
						// so the server returns a top-level error.
						Contact: { Email: this.email() || undefined, Phone: this.phone() || undefined },
					},
				},
			});

			// Operation-level errors are returned, not thrown — check the result.
			if (result?.errors?.length) {
				this.topLevelError.set(result.errors.map((e: { message: string }) => e.message).join('; '));
				return;
			}

			this.createdId.set(result?.data?.uiapi?.ContactCreate?.Record?.Id);
		} catch (err) {
			this.topLevelError.set(err instanceof Error ? err.message : 'Request failed');
		} finally {
			this.submitting.set(false);
		}
	}
}

interface ContactCreateResult {
	uiapi: {
		ContactCreate: {
			Record?: { Id: string; Name?: { value?: string | null } | null } | null;
		};
	};
}
