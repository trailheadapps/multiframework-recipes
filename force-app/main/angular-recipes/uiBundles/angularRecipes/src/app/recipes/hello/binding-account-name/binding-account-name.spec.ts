import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { BindingAccountNameComponent } from './binding-account-name';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();

async function render() {
	await TestBed.configureTestingModule({
		imports: [BindingAccountNameComponent],
	}).compileComponents();
	const fixture = TestBed.createComponent(BindingAccountNameComponent);
	// Let the mocked SDK promise chain settle, then render the updated signals.
	await fixture.whenStable();
	await new Promise((resolve) => setTimeout(resolve));
	fixture.detectChanges();
	return fixture.nativeElement as HTMLElement;
}

describe('BindingAccountNameComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery } });
	});

	afterEach(() => vi.clearAllMocks());

	it('binds the Account name', async () => {
		mockQuery.mockResolvedValue({
			data: {
				uiapi: { query: { Account: { edges: [{ node: { Id: '1', Name: { value: 'Acme' } } }] } } },
			},
		});
		expect((await render()).textContent).toContain('Acme');
	});

	it('shows an error message when the query returns GraphQL errors', async () => {
		mockQuery.mockResolvedValue({ data: null, errors: [{ message: 'boom' }] });
		expect((await render()).textContent).toContain('boom');
	});
});
