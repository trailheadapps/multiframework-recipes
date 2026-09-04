import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { LoadingErrorEmptyComponent } from './loading-error-empty';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();

async function render() {
	await TestBed.configureTestingModule({ imports: [LoadingErrorEmptyComponent] }).compileComponents();
	const fixture = TestBed.createComponent(LoadingErrorEmptyComponent);
	await fixture.whenStable();
	await new Promise((resolve) => setTimeout(resolve));
	fixture.detectChanges();
	return fixture;
}

describe('LoadingErrorEmptyComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery } });
	});

	afterEach(() => vi.clearAllMocks());

	it('renders the data state when contacts are returned', async () => {
		mockQuery.mockResolvedValue({
			data: {
				uiapi: {
					query: { Contact: { edges: [{ node: { Id: '1', Name: { value: 'Amy Taylor' }, Phone: { value: null }, Picture__c: { value: null }, Title: { value: null } } }] } },
				},
			},
		});
		const fixture = await render();
		expect(fixture.nativeElement.textContent).toContain('Amy Taylor');
	});

	it('renders the empty state when no contacts are returned', async () => {
		mockQuery.mockResolvedValue({ data: { uiapi: { query: { Contact: { edges: [] } } } } });
		const fixture = await render();
		expect(fixture.nativeElement.textContent).toContain('No Contacts Found');
	});

	it('renders the error state on the Simulate: Error control', async () => {
		mockQuery.mockResolvedValue({ data: { uiapi: { query: { Contact: { edges: [] } } } } });
		const fixture = await render();
		const buttons = fixture.nativeElement.querySelectorAll('app-button button');
		(buttons[2] as HTMLButtonElement).click();
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('Something went wrong');
		expect(fixture.nativeElement.textContent).toContain('Network request failed');
	});
});
