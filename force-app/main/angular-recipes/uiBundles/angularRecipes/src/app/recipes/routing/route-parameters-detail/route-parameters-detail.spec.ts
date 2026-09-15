import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { provideRouter } from '@angular/router';
import { createDataSDK } from '@salesforce/platform-sdk';
import { RouteParametersDetailComponent } from './route-parameters-detail';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();

function accountResult(name: string) {
	return {
		data: {
			uiapi: {
				query: {
					Account: {
						edges: [
							{
								node: {
									Id: name,
									Name: { value: name },
									Industry: { value: null },
									Phone: { value: null },
									Website: { value: null },
								},
							},
						],
					},
				},
			},
		},
	};
}

describe('RouteParametersDetailComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery } });
	});

	afterEach(() => vi.clearAllMocks());

	it('fetches the account for the bound accountId input', async () => {
		mockQuery.mockResolvedValue({
			data: { uiapi: { query: { Account: { edges: [{ node: { Id: '001X', Name: { value: 'Edge Communications' }, Industry: { value: 'Electronics' }, Phone: { value: '555-1000' }, Website: { value: null } } }] } } } },
		});
		await TestBed.configureTestingModule({
			imports: [RouteParametersDetailComponent],
			providers: [provideRouter([])],
		}).compileComponents();
		const fixture = TestBed.createComponent(RouteParametersDetailComponent);
		fixture.componentRef.setInput('accountId', '001X');
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();
		expect(mockQuery.mock.calls[0][0].variables).toEqual({ id: '001X' });
		expect(fixture.nativeElement.textContent).toContain('Edge Communications');
		expect(fixture.nativeElement.textContent).toContain('Electronics');
	});

	it('ignores a stale detail response that resolves after a newer one', async () => {
		const resolvers: ((value: unknown) => void)[] = [];
		mockQuery.mockImplementation(() => new Promise((resolve) => resolvers.push(resolve)));

		await TestBed.configureTestingModule({
			imports: [RouteParametersDetailComponent],
			providers: [provideRouter([])],
		}).compileComponents();
		const fixture = TestBed.createComponent(RouteParametersDetailComponent);

		fixture.componentRef.setInput('accountId', '001A');
		await fixture.whenStable();
		fixture.componentRef.setInput('accountId', '001B');
		await fixture.whenStable();

		expect(resolvers).toHaveLength(2);
		resolvers[1](accountResult('Newer Account'));
		resolvers[0](accountResult('Stale Account'));
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();

		const text = fixture.nativeElement.textContent;
		expect(text).toContain('Newer Account');
		expect(text).not.toContain('Stale Account');
	});
});
