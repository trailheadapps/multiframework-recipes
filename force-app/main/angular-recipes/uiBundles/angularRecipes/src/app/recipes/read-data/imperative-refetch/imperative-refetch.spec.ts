import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { ImperativeRefetchComponent } from './imperative-refetch';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();

describe('ImperativeRefetchComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery } });
		mockQuery.mockResolvedValue({
			data: {
				uiapi: {
					query: {
						Contact: { edges: [{ node: { Id: '1', Name: { value: 'Amy Taylor' }, Title: { value: null } } }] },
					},
				},
			},
		});
	});

	afterEach(() => vi.clearAllMocks());

	it('re-queries and increments the fetch count when Refresh is clicked', async () => {
		await TestBed.configureTestingModule({ imports: [ImperativeRefetchComponent] }).compileComponents();
		const fixture = TestBed.createComponent(ImperativeRefetchComponent);
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();
		expect(mockQuery).toHaveBeenCalledTimes(1);
		expect(fixture.nativeElement.textContent).toContain('Fetched 1 time');

		(fixture.nativeElement.querySelector('app-button button') as HTMLButtonElement).click();
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();
		expect(mockQuery).toHaveBeenCalledTimes(2);
		expect(fixture.nativeElement.textContent).toContain('Fetched 2 times');
	});
});
