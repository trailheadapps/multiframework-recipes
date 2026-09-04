import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { DeleteRecordComponent } from './delete-record';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();
const mockMutate = vi.fn();

describe('DeleteRecordComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery, mutate: mockMutate } });
		mockQuery.mockResolvedValue({
			data: {
				uiapi: {
					query: {
						Account: {
							edges: [
								{ node: { Id: '001A', Name: { value: 'Acme' }, Industry: { value: null } } },
								{ node: { Id: '001B', Name: { value: 'Globex' }, Industry: { value: null } } },
							],
						},
					},
				},
			},
		});
	});

	afterEach(() => vi.clearAllMocks());

	it('confirms and deletes a row, removing it from the table', async () => {
		mockMutate.mockResolvedValue({ data: { uiapi: { AccountDelete: { Id: '001A' } } } });
		await TestBed.configureTestingModule({ imports: [DeleteRecordComponent] }).compileComponents();
		const fixture = TestBed.createComponent(DeleteRecordComponent);
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelectorAll('tbody tr')).toHaveLength(2);

		// Row 1 "Delete" → confirm → "Yes, Delete"
		(fixture.nativeElement.querySelector('tbody tr app-button button') as HTMLButtonElement).click();
		fixture.detectChanges();
		(fixture.nativeElement.querySelector('tbody tr app-button button') as HTMLButtonElement).click();
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();

		expect(mockMutate.mock.calls[0][0].variables).toEqual({ input: { Id: '001A' } });
		expect(fixture.nativeElement.querySelectorAll('tbody tr')).toHaveLength(1);
		expect(fixture.nativeElement.textContent).not.toContain('Acme');
	});
});
