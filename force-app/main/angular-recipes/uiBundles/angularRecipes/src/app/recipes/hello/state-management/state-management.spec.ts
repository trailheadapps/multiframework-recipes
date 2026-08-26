import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { StateManagementComponent } from './state-management';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();

describe('StateManagementComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery } });
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
	});

	afterEach(() => vi.clearAllMocks());

	it('shows the placeholder until a sibling selection is made', async () => {
		await TestBed.configureTestingModule({
			imports: [StateManagementComponent],
		}).compileComponents();
		const fixture = TestBed.createComponent(StateManagementComponent);
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();
		const el = fixture.nativeElement as HTMLElement;
		expect(el.querySelectorAll('app-account-selector app-button')).toHaveLength(2);
		expect(el.querySelector('app-account-detail')?.textContent).toContain('Select an account');
	});

	it('displays the Account picked in the sibling selector', async () => {
		await TestBed.configureTestingModule({
			imports: [StateManagementComponent],
		}).compileComponents();
		const fixture = TestBed.createComponent(StateManagementComponent);
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();
		const el = fixture.nativeElement as HTMLElement;
		el.querySelector<HTMLButtonElement>('app-account-selector app-button button')?.click();
		await fixture.whenStable();
		fixture.detectChanges();
		const detail = el.querySelector('app-account-detail');
		expect(detail?.textContent).toContain('Acme');
		expect(detail?.textContent).not.toContain('Select an account');
	});
});
