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
});
