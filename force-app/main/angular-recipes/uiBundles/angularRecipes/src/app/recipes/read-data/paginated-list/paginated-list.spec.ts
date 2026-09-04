import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { PaginatedListComponent } from './paginated-list';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();

function page(ids: string[], hasNextPage: boolean, endCursor: string | null) {
	return {
		data: {
			uiapi: {
				query: {
					Contact: {
						pageInfo: { hasNextPage, endCursor },
						edges: ids.map((id) => ({ node: { Id: id, Name: { value: `Contact ${id}` }, Title: { value: null } } })),
					},
				},
			},
		},
	};
}

describe('PaginatedListComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery } });
	});

	afterEach(() => vi.clearAllMocks());

	it('appends the next page on Load More using the endCursor', async () => {
		mockQuery.mockResolvedValueOnce(page(['1', '2'], true, 'CURSOR_A'));
		await TestBed.configureTestingModule({ imports: [PaginatedListComponent] }).compileComponents();
		const fixture = TestBed.createComponent(PaginatedListComponent);
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelectorAll('li')).toHaveLength(2);

		mockQuery.mockResolvedValueOnce(page(['3', '4'], false, null));
		(fixture.nativeElement.querySelector('app-button button') as HTMLButtonElement).click();
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();

		expect(mockQuery.mock.calls[1][0].variables).toEqual({ after: 'CURSOR_A' });
		expect(fixture.nativeElement.querySelectorAll('li')).toHaveLength(4);
	});
});
