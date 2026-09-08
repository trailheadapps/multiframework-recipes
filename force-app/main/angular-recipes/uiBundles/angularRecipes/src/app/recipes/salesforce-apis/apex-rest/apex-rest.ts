import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { createDataSDK } from '@salesforce/platform-sdk';
import { ButtonImports } from '../../../components/ui/button/button';

/**
 * Apex REST
 *
 * Calls a custom Apex REST endpoint (ContactsResource, urlMapping='/contacts')
 * via sdk.fetch. Unlike UIAPI, Apex returns plain JSON with no { value }
 * wrappers.
 *
 * LWC equivalent: @wire an imported Apex method for reactive calls, or call an
 * imperative Apex method on demand.
 *
 * @see UiApiRestComponent — the standard UI API REST endpoints
 */
@Component({
	selector: 'app-apex-rest',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ButtonImports],
	templateUrl: './apex-rest.html',
})
export class ApexRestComponent {
	protected readonly nameFilter = signal('');
	protected readonly contacts = signal<ApexContact[] | undefined>(undefined);
	protected readonly loading = signal(false);
	protected readonly error = signal<string | undefined>(undefined);

	protected async onSubmit(event: Event): Promise<void> {
		event.preventDefault();
		this.loading.set(true);
		this.error.set(undefined);
		try {
			this.contacts.set(await this.fetchContactsFromApex(this.nameFilter()));
		} catch (err) {
			this.error.set(err instanceof Error ? err.message : 'Request failed');
		} finally {
			this.loading.set(false);
		}
	}

	// GET /services/apexrest/contacts          — first 10 contacts
	// GET /services/apexrest/contacts?name=... — filtered by name
	private async fetchContactsFromApex(nameFilter: string): Promise<ApexContact[]> {
		const sdk = await createDataSDK();
		const url = nameFilter
			? `/services/apexrest/contacts?name=${encodeURIComponent(nameFilter)}`
			: '/services/apexrest/contacts';
		const res = await sdk.fetch?.(url);
		if (!res?.ok) {
			throw new Error(`Apex REST error: ${res?.status}`);
		}
		const data: ApexContact[] = await res.json();
		return data;
	}
}

interface ApexContact {
	id: string;
	name: string;
	title: string | null;
	phone: string | null;
	pictureUrl: string | null;
}
