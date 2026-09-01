import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { ListOfRecordsComponent } from './list-of-records';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();

describe('ListOfRecordsComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery } });
	});

	afterEach(() => vi.clearAllMocks());

	it('renders one list item per Contact', async () => {
		mockQuery.mockResolvedValue({
			data: {
				uiapi: {
					query: {
						Contact: {
							edges: [
								{ node: { Id: '1', Name: { value: 'Amy Taylor' }, Title: { value: 'VP' }, Phone: { value: null }, Picture__c: { value: null } } },
								{ node: { Id: '2', Name: { value: 'Brian King' }, Title: { value: null }, Phone: { value: null }, Picture__c: { value: null } } },
							],
						},
					},
				},
			},
		});
		await TestBed.configureTestingModule({ imports: [ListOfRecordsComponent] }).compileComponents();
		const fixture = TestBed.createComponent(ListOfRecordsComponent);
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();
		const el = fixture.nativeElement as HTMLElement;
		expect(el.querySelectorAll('li')).toHaveLength(2);
		expect(el.textContent).toContain('Amy Taylor');
		expect(el.textContent).toContain('Brian King');
	});
});
