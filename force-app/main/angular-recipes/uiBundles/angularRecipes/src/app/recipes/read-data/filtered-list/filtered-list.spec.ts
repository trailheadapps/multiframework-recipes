import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { FilteredListComponent } from './filtered-list';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();

function contactResult(name: string) {
	return {
		data: {
			uiapi: {
				query: {
					Contact: {
						edges: [
							{
								node: {
									Id: name,
									Name: { value: name },
									Title: { value: null },
									Phone: { value: null },
									Picture__c: { value: null },
								},
							},
						],
					},
				},
			},
		},
	};
}

describe('FilteredListComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery } });
	});

	afterEach(() => {
		vi.clearAllMocks();
		vi.useRealTimers();
	});

	it('queries with a wildcard variable and renders matches after debounce', async () => {
		mockQuery.mockResolvedValue({
			data: {
				uiapi: {
					query: {
						Contact: {
							edges: [
								{ node: { Id: '1', Name: { value: 'Amy Taylor' }, Title: { value: null }, Phone: { value: null }, Picture__c: { value: null } } },
							],
						},
					},
				},
			},
		});
		await TestBed.configureTestingModule({ imports: [FilteredListComponent] }).compileComponents();
		const fixture = TestBed.createComponent(FilteredListComponent);
		fixture.detectChanges();

		const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
		input.value = 'Amy';
		input.dispatchEvent(new Event('input'));

		// Wait past the 300ms debounce, then let the mocked promise chain settle.
		await new Promise((resolve) => setTimeout(resolve, 350));
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();

		expect(mockQuery).toHaveBeenCalledWith(expect.objectContaining({ variables: { name: '%Amy%' } }));
		expect(fixture.nativeElement.textContent).toContain('Amy Taylor');
	});

	it('ignores a stale response that resolves after a newer one', async () => {
		vi.useFakeTimers();
		const resolvers: ((value: unknown) => void)[] = [];
		mockQuery.mockImplementation(() => new Promise((resolve) => resolvers.push(resolve)));

		await TestBed.configureTestingModule({ imports: [FilteredListComponent] }).compileComponents();
		const fixture = TestBed.createComponent(FilteredListComponent);
		fixture.detectChanges();
		const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

		input.value = 'a';
		input.dispatchEvent(new Event('input'));
		await vi.advanceTimersByTimeAsync(300);
		input.value = 'ab';
		input.dispatchEvent(new Event('input'));
		await vi.advanceTimersByTimeAsync(300);

		expect(resolvers).toHaveLength(2);
		resolvers[1](contactResult('Newer Match'));
		resolvers[0](contactResult('Stale Match'));
		await vi.advanceTimersByTimeAsync(0);
		fixture.detectChanges();

		const text = fixture.nativeElement.textContent;
		expect(text).toContain('Newer Match');
		expect(text).not.toContain('Stale Match');
	});
});
