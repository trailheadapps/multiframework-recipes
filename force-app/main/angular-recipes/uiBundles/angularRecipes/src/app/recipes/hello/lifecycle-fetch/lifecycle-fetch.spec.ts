import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { LifecycleFetchComponent } from './lifecycle-fetch';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();

async function render() {
	await TestBed.configureTestingModule({ imports: [LifecycleFetchComponent] }).compileComponents();
	const fixture = TestBed.createComponent(LifecycleFetchComponent);
	// Let the child fetcher's mocked SDK chain settle, then render.
	await fixture.whenStable();
	await new Promise((resolve) => setTimeout(resolve));
	fixture.detectChanges();
	return fixture;
}

describe('LifecycleFetchComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery } });
		mockQuery.mockResolvedValue({
			data: {
				uiapi: {
					query: {
						Contact: {
							edges: [
								{ node: { Id: '1', Name: { value: 'Ada Lovelace' }, Title: { value: 'CTO' } } },
							],
						},
					},
				},
			},
		});
	});

	afterEach(() => vi.clearAllMocks());

	it('mounts the fetcher and shows the Contact', async () => {
		const fixture = await render();
		expect((fixture.nativeElement as HTMLElement).textContent).toContain('Ada Lovelace');
	});

	it('unmounts the fetcher when the toggle is clicked', async () => {
		const fixture = await render();
		const el = fixture.nativeElement as HTMLElement;
		expect(el.querySelector('app-contact-fetcher')).not.toBeNull();
		el.querySelector<HTMLButtonElement>('app-button button')?.click();
		await fixture.whenStable();
		fixture.detectChanges();
		expect(el.querySelector('app-contact-fetcher')).toBeNull();
	});
});
