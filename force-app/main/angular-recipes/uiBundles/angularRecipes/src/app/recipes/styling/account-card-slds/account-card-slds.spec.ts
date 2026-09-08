import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { AccountCardSldsComponent } from './account-card-slds';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();

describe('AccountCardSldsComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery } });
	});

	afterEach(() => vi.clearAllMocks());

	it('renders the account name, industry, and formatted revenue in an SLDS card', async () => {
		mockQuery.mockResolvedValue({
			data: {
				uiapi: {
					query: {
						Account: {
							edges: [{ node: { Id: '1', Name: { value: 'Edge Communications' }, Industry: { value: 'Electronics' }, AnnualRevenue: { value: 5200000 } } }],
						},
					},
				},
			},
		});
		await TestBed.configureTestingModule({ imports: [AccountCardSldsComponent] }).compileComponents();
		const fixture = TestBed.createComponent(AccountCardSldsComponent);
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();
		const el = fixture.nativeElement as HTMLElement;
		expect(el.querySelector('.slds-card')).toBeTruthy();
		expect(el.textContent).toContain('Edge Communications');
		expect(el.textContent).toContain('Electronics');
		expect(el.textContent).toContain('$5.2M');
	});
});
