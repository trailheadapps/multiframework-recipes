import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { ListOfAccountsComponent } from './list-of-accounts';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();

describe('ListOfAccountsComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery } });
	});

	afterEach(() => vi.clearAllMocks());

	it('renders one list item per Account', async () => {
		mockQuery.mockResolvedValue({
			data: {
				uiapi: {
					query: {
						Account: {
							edges: [
								{ node: { Id: '1', Name: { value: 'Acme' }, Industry: { value: 'Technology' } } },
								{ node: { Id: '2', Name: { value: 'Globex' }, Industry: { value: null } } },
							],
						},
					},
				},
			},
		});
		await TestBed.configureTestingModule({
			imports: [ListOfAccountsComponent],
		}).compileComponents();
		const fixture = TestBed.createComponent(ListOfAccountsComponent);
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();
		const el = fixture.nativeElement as HTMLElement;
		expect(el.querySelectorAll('li')).toHaveLength(2);
		expect(el.textContent).toContain('Acme');
		expect(el.textContent).toContain('Globex');
	});
});
