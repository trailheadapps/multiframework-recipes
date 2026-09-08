import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { SortedResultsComponent } from './sorted-results';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();

describe('SortedResultsComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery } });
		mockQuery.mockResolvedValue({
			data: {
				uiapi: {
					query: {
						Contact: {
							edges: [
								{ node: { Id: '1', Name: { value: 'Amy Taylor' }, Title: { value: 'VP' } } },
							],
						},
					},
				},
			},
		});
	});

	afterEach(() => vi.clearAllMocks());

	it('loads sorted contacts on init and rebuilds the query when the direction changes', async () => {
		await TestBed.configureTestingModule({ imports: [SortedResultsComponent] }).compileComponents();
		const fixture = TestBed.createComponent(SortedResultsComponent);
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('Amy Taylor');
		expect(mockQuery.mock.calls[0][0].query).toContain('order: ASC');

		const dir = fixture.nativeElement.querySelectorAll('select')[1] as HTMLSelectElement;
		dir.value = 'DESC';
		dir.dispatchEvent(new Event('change'));
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		expect(mockQuery.mock.calls[1][0].query).toContain('order: DESC');
	});
});
