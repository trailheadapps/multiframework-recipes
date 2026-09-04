import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { provideRouter } from '@angular/router';
import { createDataSDK } from '@salesforce/platform-sdk';
import { RouteParametersComponent } from './route-parameters';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();

describe('RouteParametersComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery } });
	});

	afterEach(() => vi.clearAllMocks());

	it('links each account to its :accountId detail route', async () => {
		mockQuery.mockResolvedValue({
			data: { uiapi: { query: { Account: { edges: [{ node: { Id: '001X', Name: { value: 'Acme' }, Industry: { value: null } } }] } } } },
		});
		await TestBed.configureTestingModule({
			imports: [RouteParametersComponent],
			providers: [provideRouter([])],
		}).compileComponents();
		const fixture = TestBed.createComponent(RouteParametersComponent);
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();
		const link = fixture.nativeElement.querySelector('a');
		expect(link.getAttribute('href')).toBe('/routing/route-parameters/001X');
		expect(link.textContent).toContain('Acme');
	});
});
