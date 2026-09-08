import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { UpdateRecordComponent } from './update-record';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();
const mockMutate = vi.fn();

describe('UpdateRecordComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery, mutate: mockMutate } });
		mockQuery.mockResolvedValue({
			data: { uiapi: { query: { Account: { edges: [{ node: { Id: '001X', Name: { value: 'Acme' }, Industry: { value: 'Technology' } } }] } } } },
		});
	});

	afterEach(() => vi.clearAllMocks());

	it('loads an account, then saves changes via AccountUpdate with a top-level Id', async () => {
		mockMutate.mockResolvedValue({ data: { uiapi: { AccountUpdate: { Record: { Id: '001X', Name: { value: 'Acme Renamed' }, Industry: { value: 'Technology' } } } } } });
		await TestBed.configureTestingModule({ imports: [UpdateRecordComponent] }).compileComponents();
		const fixture = TestBed.createComponent(UpdateRecordComponent);
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();

		const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
		expect(input.value).toBe('Acme');
		input.value = 'Acme Renamed';
		input.dispatchEvent(new Event('input'));
		(fixture.nativeElement.querySelector('app-button button') as HTMLButtonElement).click();
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();

		expect(mockMutate.mock.calls[0][0].variables).toEqual({
			input: { Id: '001X', Account: { Name: 'Acme Renamed', Industry: 'Technology' } },
		});
		expect(fixture.nativeElement.textContent).toContain('updated successfully');
	});
});
