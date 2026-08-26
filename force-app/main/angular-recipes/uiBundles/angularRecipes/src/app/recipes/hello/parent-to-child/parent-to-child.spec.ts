import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { ParentToChildComponent } from './parent-to-child';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();

describe('ParentToChildComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery } });
	});

	afterEach(() => vi.clearAllMocks());

	it('passes each Account to a child card', async () => {
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
		await TestBed.configureTestingModule({ imports: [ParentToChildComponent] }).compileComponents();
		const fixture = TestBed.createComponent(ParentToChildComponent);
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();
		const el = fixture.nativeElement as HTMLElement;
		expect(el.querySelectorAll('app-account-card')).toHaveLength(2);
		expect(el.textContent).toContain('Acme');
		expect(el.textContent).toContain('No Industry');
	});
});
