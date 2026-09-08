import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { SearchableAccountListComponent } from './searchable-account-list';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();

function accounts(names: string[]) {
	return {
		data: {
			uiapi: {
				query: {
					Account: {
						edges: names.map((name, i) => ({ node: { Id: String(i), Name: { value: name }, Industry: { value: null } } })),
					},
				},
			},
		},
	};
}

describe('SearchableAccountListComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery } });
	});

	afterEach(() => vi.clearAllMocks());

	it('loads all accounts on mount, then filters with a wildcard variable after debounce', async () => {
		mockQuery.mockResolvedValueOnce(accounts(['Acme', 'Globex']));
		await TestBed.configureTestingModule({ imports: [SearchableAccountListComponent] }).compileComponents();
		const fixture = TestBed.createComponent(SearchableAccountListComponent);
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelectorAll('li')).toHaveLength(2);
		expect(mockQuery.mock.calls[0][0].variables).toEqual({ name: '%%' });

		mockQuery.mockResolvedValueOnce(accounts(['Acme']));
		const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
		input.value = 'Acme';
		input.dispatchEvent(new Event('input'));
		await new Promise((resolve) => setTimeout(resolve, 400));
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();
		expect(mockQuery.mock.calls[1][0].variables).toEqual({ name: '%Acme%' });
		expect(fixture.nativeElement.querySelectorAll('li')).toHaveLength(1);
	});
});
