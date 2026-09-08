import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { ApexRestComponent } from './apex-rest';

vi.mock('@salesforce/platform-sdk', () => ({ createDataSDK: vi.fn() }));

const mockFetch = vi.fn();

describe('ApexRestComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ fetch: mockFetch });
	});

	afterEach(() => vi.clearAllMocks());

	it('submits the filter and renders contacts from the Apex endpoint', async () => {
		mockFetch.mockResolvedValue({
			ok: true,
			json: async () => [{ id: '1', name: 'Amy Taylor', title: 'VP', phone: null, pictureUrl: null }],
		});
		await TestBed.configureTestingModule({ imports: [ApexRestComponent] }).compileComponents();
		const fixture = TestBed.createComponent(ApexRestComponent);
		fixture.detectChanges();

		const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
		input.value = 'Taylor';
		input.dispatchEvent(new Event('input'));
		(fixture.nativeElement.querySelector('app-button button') as HTMLButtonElement).click();
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();

		expect(mockFetch).toHaveBeenCalledWith('/services/apexrest/contacts?name=Taylor');
		expect(fixture.nativeElement.textContent).toContain('Amy Taylor');
	});
});
