import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { GraphqlErrorsComponent } from './graphql-errors';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();

describe('GraphqlErrorsComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery } });
	});

	afterEach(() => vi.clearAllMocks());

	it('surfaces query-level errors from result.errors', async () => {
		mockQuery.mockResolvedValue({ errors: [{ message: "Field 'NonExistentField__c' doesn't exist" }] });
		await TestBed.configureTestingModule({ imports: [GraphqlErrorsComponent] }).compileComponents();
		const fixture = TestBed.createComponent(GraphqlErrorsComponent);
		fixture.detectChanges();
		(fixture.nativeElement.querySelectorAll('app-button button')[0] as HTMLButtonElement).click();
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('1 error returned');
		expect(fixture.nativeElement.textContent).toContain("doesn't exist");
	});

	it('renders the error path when UIAPI includes one', async () => {
		mockQuery.mockResolvedValue({
			errors: [{ message: 'Bad field', path: ['uiapi', 'query', 'Account'] }],
		});
		await TestBed.configureTestingModule({ imports: [GraphqlErrorsComponent] }).compileComponents();
		const fixture = TestBed.createComponent(GraphqlErrorsComponent);
		fixture.detectChanges();
		(fixture.nativeElement.querySelectorAll('app-button button')[0] as HTMLButtonElement).click();
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('path: uiapi.query.Account');
	});

	it('shows a success message when the query returns no errors', async () => {
		mockQuery.mockResolvedValue({ data: { uiapi: { query: { Account: { edges: [] } } } } });
		await TestBed.configureTestingModule({ imports: [GraphqlErrorsComponent] }).compileComponents();
		const fixture = TestBed.createComponent(GraphqlErrorsComponent);
		fixture.detectChanges();
		(fixture.nativeElement.querySelectorAll('app-button button')[1] as HTMLButtonElement).click();
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('succeeded — no errors');
	});
});
