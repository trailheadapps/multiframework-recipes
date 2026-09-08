import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { QueryMutationTogetherComponent } from './query-mutation-together';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();
const mockMutate = vi.fn();

describe('QueryMutationTogetherComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery, mutate: mockMutate } });
		mockQuery.mockResolvedValue({
			data: { uiapi: { query: { Account: { edges: [{ node: { Id: '001A', Name: { value: 'Acme' }, Industry: { value: 'Technology' } } }] } } } },
		});
	});

	afterEach(() => vi.clearAllMocks());

	it('edits a row inline and patches it from the AccountUpdate response', async () => {
		mockMutate.mockResolvedValue({ data: { uiapi: { AccountUpdate: { Record: { Id: '001A', Name: { value: 'Acme Renamed' }, Industry: { value: 'Technology' } } } } } });
		await TestBed.configureTestingModule({ imports: [QueryMutationTogetherComponent] }).compileComponents();
		const fixture = TestBed.createComponent(QueryMutationTogetherComponent);
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();

		// Edit → inline form
		(fixture.nativeElement.querySelector('tbody app-button button') as HTMLButtonElement).click();
		fixture.detectChanges();
		const input = fixture.nativeElement.querySelector('tbody input') as HTMLInputElement;
		input.value = 'Acme Renamed';
		input.dispatchEvent(new Event('input'));
		fixture.detectChanges();
		// Save is the first button in the edit row
		(fixture.nativeElement.querySelector('tbody form app-button button') as HTMLButtonElement).click();
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();

		expect(mockMutate.mock.calls[0][0].variables).toEqual({
			input: { Id: '001A', Account: { Name: 'Acme Renamed', Industry: 'Technology' } },
		});
		expect(fixture.nativeElement.textContent).toContain('Acme Renamed');
	});
});
