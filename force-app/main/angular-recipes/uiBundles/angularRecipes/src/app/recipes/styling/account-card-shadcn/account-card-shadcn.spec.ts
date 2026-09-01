import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { AccountCardShadcnComponent } from './account-card-shadcn';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();

describe('AccountCardShadcnComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery } });
	});

	afterEach(() => vi.clearAllMocks());

	it('renders the account in a spartan-ng card', async () => {
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
		await TestBed.configureTestingModule({ imports: [AccountCardShadcnComponent] }).compileComponents();
		const fixture = TestBed.createComponent(AccountCardShadcnComponent);
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();
		const el = fixture.nativeElement as HTMLElement;
		expect(el.querySelector('app-card')).toBeTruthy();
		expect(el.textContent).toContain('Edge Communications');
		expect(el.textContent).toContain('$5.2M');
	});
});
