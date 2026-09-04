import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { createDataSDK } from '@salesforce/platform-sdk';

/**
 * UI API (REST)
 *
 * Uses sdk.fetch against two UI API REST endpoints: list-ui to discover the
 * AllContacts list view, then list-records to fetch its contacts. REST fields
 * arrive as { value } (and can include { displayValue } locale formatting that
 * GraphQL doesn't expose).
 *
 * LWC equivalent: @wire(getListUi) then @wire(getListRecords), with automatic
 * caching.
 *
 * @see ApexRestComponent — calling a custom Apex REST endpoint
 */
@Component({
	selector: 'app-ui-api-rest',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './ui-api-rest.html',
})
export class UiApiRestComponent implements OnInit {
	protected readonly records = signal<UiApiRecord[] | undefined>(undefined);
	protected readonly loading = signal(true);
	protected readonly error = signal<string | undefined>(undefined);

	async ngOnInit(): Promise<void> {
		try {
			this.records.set(await this.fetchContactsViaUiApi());
		} catch (err) {
			this.error.set(err instanceof Error ? err.message : 'Request failed');
		} finally {
			this.loading.set(false);
		}
	}

	private async fetchContactsViaUiApi(): Promise<UiApiRecord[]> {
		const sdk = await createDataSDK();

		// Step 1: list the Contact list views and find AllContacts.
		const listUiRes = await sdk.fetch?.('/services/data/v66.0/ui-api/list-ui/Contact');
		if (!listUiRes?.ok) {
			throw new Error(`List UI fetch failed (${listUiRes?.status})`);
		}
		const listUiData: ListUiResponse = await listUiRes.json();
		const allContacts = listUiData.lists.find((l) => l.apiName === 'AllContacts');
		if (!allContacts) {
			throw new Error('AllContacts list view not found');
		}

		// Step 2: fetch records from that list view.
		const fields = 'Contact.Name,Contact.Title,Contact.Phone,Contact.Picture__c';
		const listRecordsRes = await sdk.fetch?.(
			`/services/data/v66.0/ui-api/list-records/${allContacts.id}?fields=${fields}`,
		);
		if (!listRecordsRes?.ok) {
			throw new Error(`List records fetch failed (${listRecordsRes?.status})`);
		}
		const listRecordsData: ListRecordsResponse = await listRecordsRes.json();
		return listRecordsData.records;
	}
}

interface ListUiResponse {
	lists: { id: string; apiName: string; label: string }[];
}

interface ListRecordsResponse {
	records: UiApiRecord[];
}

interface UiApiRecord {
	fields: {
		Name: { value: string | null };
		Title: { value: string | null };
		Phone: { value: string | null };
		Picture__c: { value: string | null };
	};
}
