import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { RelatedRecordsComponent } from './related-records';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();

describe('RelatedRecordsComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery } });
	});

	afterEach(() => vi.clearAllMocks());

	it('renders each Contact with its parent Account name', async () => {
		mockQuery.mockResolvedValue({
			data: {
				uiapi: {
					query: {
						Contact: {
							edges: [
								{ node: { Id: '1', Name: { value: 'Amy Taylor' }, Title: { value: null }, Account: { Name: { value: 'Edge Communications' } } } },
								{ node: { Id: '2', Name: { value: 'Brian King' }, Title: { value: null }, Account: null } },
							],
						},
					},
				},
			},
		});
		await TestBed.configureTestingModule({ imports: [RelatedRecordsComponent] }).compileComponents();
		const fixture = TestBed.createComponent(RelatedRecordsComponent);
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();
		const el = fixture.nativeElement as HTMLElement;
		expect(el.querySelectorAll('ul li')).toHaveLength(2);
		expect(el.textContent).toContain('Edge Communications');
	});
});
