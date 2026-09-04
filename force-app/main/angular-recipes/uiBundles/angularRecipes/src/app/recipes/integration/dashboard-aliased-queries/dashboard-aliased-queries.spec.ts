import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { DashboardAliasedQueriesComponent } from './dashboard-aliased-queries';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();

function edges(n: number) {
	return { edges: Array.from({ length: n }, (_, i) => ({ node: { Id: String(i) } })) };
}

describe('DashboardAliasedQueriesComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery } });
	});

	afterEach(() => vi.clearAllMocks());

	it('renders a stat card count for each aliased object', async () => {
		mockQuery.mockResolvedValue({
			data: { uiapi: { query: { accounts: edges(4), contacts: edges(6), opportunities: edges(3) } } },
		});
		await TestBed.configureTestingModule({ imports: [DashboardAliasedQueriesComponent] }).compileComponents();
		const fixture = TestBed.createComponent(DashboardAliasedQueriesComponent);
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();
		const text = fixture.nativeElement.textContent;
		expect(text).toContain('4');
		expect(text).toContain('Accounts');
		expect(text).toContain('6');
		expect(text).toContain('Contacts');
		expect(text).toContain('3');
		expect(text).toContain('Opportunities');
	});
});
