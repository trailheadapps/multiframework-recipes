import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { UiApiRestComponent } from './ui-api-rest';

vi.mock('@salesforce/platform-sdk', () => ({ createDataSDK: vi.fn() }));

const mockFetch = vi.fn();

describe('UiApiRestComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ fetch: mockFetch });
	});

	afterEach(() => vi.clearAllMocks());

	it('resolves AllContacts via list-ui, then renders its records from list-records', async () => {
		mockFetch.mockImplementation((url: string) => {
			if (url.includes('/list-ui/Contact')) {
				return Promise.resolve({ ok: true, json: async () => ({ lists: [{ id: '00B_ALL', apiName: 'AllContacts', label: 'All Contacts' }] }) });
			}
			return Promise.resolve({
				ok: true,
				json: async () => ({ records: [{ fields: { Name: { value: 'Amy Taylor' }, Title: { value: 'VP' }, Phone: { value: null }, Picture__c: { value: null } } }] }),
			});
		});
		await TestBed.configureTestingModule({ imports: [UiApiRestComponent] }).compileComponents();
		const fixture = TestBed.createComponent(UiApiRestComponent);
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();
		expect(mockFetch.mock.calls[1][0]).toContain('/list-records/00B_ALL');
		expect(fixture.nativeElement.textContent).toContain('Amy Taylor');
	});
});
