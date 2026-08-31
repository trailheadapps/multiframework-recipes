import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { ConditionalStatusComponent } from './conditional-status';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();

function accountResponse(industry: string | null) {
	return {
		data: {
			uiapi: {
				query: {
					Account: {
						edges: [{ node: { Id: '1', Name: { value: 'Acme' }, Industry: { value: industry } } }],
					},
				},
			},
		},
	};
}

async function render() {
	await TestBed.configureTestingModule({
		imports: [ConditionalStatusComponent],
	}).compileComponents();
	const fixture = TestBed.createComponent(ConditionalStatusComponent);
	// Let the mocked SDK promise chain settle, then render the updated signals.
	await fixture.whenStable();
	await new Promise((resolve) => setTimeout(resolve));
	fixture.detectChanges();
	return fixture.nativeElement as HTMLElement;
}

describe('ConditionalStatusComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery } });
	});

	afterEach(() => vi.clearAllMocks());

	it('renders the Industry badge when the Account has one', async () => {
		mockQuery.mockResolvedValue(accountResponse('Technology'));
		expect((await render()).textContent).toContain('Technology');
	});

	it('renders the fallback when the Account has no Industry', async () => {
		mockQuery.mockResolvedValue(accountResponse(null));
		expect((await render()).textContent).toContain('No Industry Set');
	});
});
