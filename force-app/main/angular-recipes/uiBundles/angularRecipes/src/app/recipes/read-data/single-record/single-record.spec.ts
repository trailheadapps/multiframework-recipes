import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { SingleRecordComponent } from './single-record';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();

describe('SingleRecordComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery } });
	});

	afterEach(() => vi.clearAllMocks());

	it('renders the fetched Contact fields', async () => {
		mockQuery.mockResolvedValue({
			data: {
				uiapi: {
					query: {
						Contact: {
							edges: [
								{
									node: {
										Id: '1',
										Name: { value: 'Amy Taylor' },
										Title: { value: 'VP of Engineering' },
										Phone: { value: '555-1000' },
										Picture__c: { value: 'https://example.com/a.jpg' },
									},
								},
							],
						},
					},
				},
			},
		});
		await TestBed.configureTestingModule({ imports: [SingleRecordComponent] }).compileComponents();
		const fixture = TestBed.createComponent(SingleRecordComponent);
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();
		const el = fixture.nativeElement as HTMLElement;
		expect(el.textContent).toContain('Amy Taylor');
		expect(el.textContent).toContain('VP of Engineering');
	});
});
