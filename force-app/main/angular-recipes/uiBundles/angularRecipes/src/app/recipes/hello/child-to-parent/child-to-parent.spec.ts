import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { ChildToParentComponent } from './child-to-parent';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();

async function render() {
	await TestBed.configureTestingModule({ imports: [ChildToParentComponent] }).compileComponents();
	const fixture = TestBed.createComponent(ChildToParentComponent);
	await fixture.whenStable();
	return fixture;
}

describe('ChildToParentComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery } });
	});

	afterEach(() => vi.clearAllMocks());

	it('fetches and lists Accounts for the selected Industry', async () => {
		mockQuery.mockResolvedValue({
			data: {
				uiapi: { query: { Account: { edges: [{ node: { Id: '1', Name: { value: 'Acme' } } }] } } },
			},
		});
		const fixture = await render();
		await fixture.componentInstance.onIndustry('Technology');
		await fixture.whenStable();
		fixture.detectChanges();
		expect(mockQuery).toHaveBeenCalledWith(
			expect.objectContaining({ variables: { industry: 'Technology' } }),
		);
		expect((fixture.nativeElement as HTMLElement).textContent).toContain('Acme');
	});

	it('shows an empty message when no Accounts match', async () => {
		mockQuery.mockResolvedValue({ data: { uiapi: { query: { Account: { edges: [] } } } } });
		const fixture = await render();
		await fixture.componentInstance.onIndustry('Energy');
		await fixture.whenStable();
		fixture.detectChanges();
		expect((fixture.nativeElement as HTMLElement).textContent).toContain('No accounts in Energy');
	});
});
