import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { DisplayCurrentUserComponent } from './display-current-user';

vi.mock('@salesforce/platform-sdk', () => ({ createDataSDK: vi.fn() }));

const mockFetch = vi.fn();

describe('DisplayCurrentUserComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ fetch: mockFetch });
	});

	afterEach(() => vi.clearAllMocks());

	it('fetches and displays the current user from /users/me', async () => {
		mockFetch.mockResolvedValue({
			ok: true,
			json: async () => ({ displayName: 'Astro Nomical', email: 'astro@example.com' }),
		});
		await TestBed.configureTestingModule({ imports: [DisplayCurrentUserComponent] }).compileComponents();
		const fixture = TestBed.createComponent(DisplayCurrentUserComponent);
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();
		expect(mockFetch).toHaveBeenCalledWith('/services/data/v66.0/chatter/users/me');
		expect(fixture.nativeElement.textContent).toContain('Astro Nomical');
		expect(fixture.nativeElement.textContent).toContain('astro@example.com');
	});
});
