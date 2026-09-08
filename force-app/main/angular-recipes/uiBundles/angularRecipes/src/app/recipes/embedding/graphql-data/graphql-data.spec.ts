import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { getViewSDK } from '@salesforce/platform-sdk';
import { GraphqlDataComponent } from './graphql-data';

vi.mock('@salesforce/platform-sdk', () => ({ getViewSDK: vi.fn() }));

function stubView() {
	const handlers: Record<string, (e: Event) => void> = {};
	return {
		addEventListener: (type: string, cb: (e: Event) => void) => {
			handlers[type] = cb;
		},
		removeEventListener: () => undefined,
		dispatchEvent: vi.fn(),
		// Test helper: simulate the host pushing a contactsdata event.
		push: (detail: unknown) => handlers['contactsdata']?.(new CustomEvent('contactsdata', { detail })),
	};
}

async function flush(fixture: { whenStable(): Promise<unknown>; detectChanges(): void }) {
	await fixture.whenStable();
	await new Promise((resolve) => setTimeout(resolve));
	fixture.detectChanges();
}

async function render() {
	await TestBed.configureTestingModule({ imports: [GraphqlDataComponent] }).compileComponents();
	const fixture = TestBed.createComponent(GraphqlDataComponent);
	await flush(fixture);
	return fixture;
}

describe('GraphqlDataComponent', () => {
	afterEach(() => vi.clearAllMocks());

	it('waits for host data before anything arrives', async () => {
		(getViewSDK as Mock).mockResolvedValue(stubView());
		expect((await render()).nativeElement.textContent).toContain('Waiting for the host');
	});

	it('asks the host to (re)send contacts once it is listening', async () => {
		const view = stubView();
		(getViewSDK as Mock).mockResolvedValue(view);
		await render();
		expect(view.dispatchEvent).toHaveBeenCalledTimes(1);
		expect((view.dispatchEvent.mock.calls[0][0] as CustomEvent).type).toBe('requestcontacts');
	});

	it('renders contacts the host pushes down', async () => {
		const view = stubView();
		(getViewSDK as Mock).mockResolvedValue(view);
		const fixture = await render();

		view.push({
			accountName: 'Acme',
			loaded: true,
			contacts: [{ id: '003', name: 'Ada Lovelace', title: 'CTO', email: 'ada@example.com', phone: '555-0100' }],
		});
		await flush(fixture);

		const text = fixture.nativeElement.textContent;
		expect(text).toContain('Acme contacts');
		expect(text).toContain('Ada Lovelace');
		expect(text).toContain('CTO');
		expect(text).toContain('1 contact related to Acme');
	});

	it('shows the empty state when the account has no contacts', async () => {
		const view = stubView();
		(getViewSDK as Mock).mockResolvedValue(view);
		const fixture = await render();

		view.push({ accountName: 'Acme', loaded: true, contacts: [] });
		await flush(fixture);

		expect(fixture.nativeElement.textContent).toContain('No contacts related to Acme');
	});
});
