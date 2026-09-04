import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { provideRouter } from '@angular/router';
import { createDataSDK } from '@salesforce/platform-sdk';
import { NestedRoutesComponent } from './nested-routes';
import { NestedRoutesStore } from './nested-routes-store';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();

describe('NestedRoutesComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery } });
	});

	afterEach(() => vi.clearAllMocks());

	it('loads the shared account list on init and renders one sidebar link per account', async () => {
		mockQuery.mockResolvedValue({
			data: {
				uiapi: {
					query: {
						Account: {
							edges: [
								{ node: { Id: '001A', Name: { value: 'Acme' }, Industry: { value: 'Technology' } } },
								{ node: { Id: '001B', Name: { value: 'Globex' }, Industry: { value: null } } },
							],
						},
					},
				},
			},
		});
		await TestBed.configureTestingModule({
			imports: [NestedRoutesComponent],
			// NestedRoutesStore is normally route-scoped (app.routes.ts); provide it here.
			providers: [provideRouter([]), NestedRoutesStore],
		}).compileComponents();
		const fixture = TestBed.createComponent(NestedRoutesComponent);
		fixture.detectChanges();
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();

		const links = fixture.nativeElement.querySelectorAll('a');
		expect(links).toHaveLength(2);
		expect(fixture.nativeElement.textContent).toContain('Acme');
		expect(fixture.nativeElement.textContent).toContain('Globex');
	});
});
