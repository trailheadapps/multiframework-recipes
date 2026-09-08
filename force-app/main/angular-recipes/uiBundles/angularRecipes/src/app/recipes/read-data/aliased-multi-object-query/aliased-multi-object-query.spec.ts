import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { AliasedMultiObjectQueryComponent } from './aliased-multi-object-query';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();

describe('AliasedMultiObjectQueryComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery } });
	});

	afterEach(() => vi.clearAllMocks());

	it('counts the edges of each aliased connection', async () => {
		mockQuery.mockResolvedValue({
			data: {
				uiapi: {
					query: {
						accounts: { edges: [{ node: { Id: 'a1' } }, { node: { Id: 'a2' } }, { node: { Id: 'a3' } }] },
						contacts: { edges: [{ node: { Id: 'c1' } }, { node: { Id: 'c2' } }] },
					},
				},
			},
		});
		await TestBed.configureTestingModule({ imports: [AliasedMultiObjectQueryComponent] }).compileComponents();
		const fixture = TestBed.createComponent(AliasedMultiObjectQueryComponent);
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();
		const el = fixture.nativeElement as HTMLElement;
		expect(el.textContent).toContain('3');
		expect(el.textContent).toContain('Accounts');
		expect(el.textContent).toContain('2');
		expect(el.textContent).toContain('Contacts');
	});
});
