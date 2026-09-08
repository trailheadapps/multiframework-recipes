import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { getViewSDK } from '@salesforce/platform-sdk';
import { ReceiveEventComponent } from './receive-event';

vi.mock('@salesforce/platform-sdk', () => ({ getViewSDK: vi.fn() }));

function stubView(props: Record<string, unknown>) {
	const handlers: Record<string, () => void> = {};
	return {
		getUiState: () => ({ state: { props }, subscribe: () => () => undefined }),
		addEventListener: (type: string, cb: () => void) => {
			handlers[type] = cb;
		},
		removeEventListener: () => undefined,
		fire: (type: string) => handlers[type]?.(),
	};
}

async function flush(fixture: { whenStable(): Promise<unknown>; detectChanges(): void }) {
	await fixture.whenStable();
	await new Promise((resolve) => setTimeout(resolve));
	fixture.detectChanges();
}

async function render() {
	await TestBed.configureTestingModule({ imports: [ReceiveEventComponent] }).compileComponents();
	const fixture = TestBed.createComponent(ReceiveEventComponent);
	await flush(fixture);
	return fixture;
}

describe('ReceiveEventComponent', () => {
	afterEach(() => vi.clearAllMocks());

	it('shows a quote once a ticker arrives via ui-state', async () => {
		(getViewSDK as Mock).mockResolvedValue(stubView({ recordId: '001', name: 'Acme', tickerSymbol: 'CRM' }));
		const text = (await render()).nativeElement.textContent;
		expect(text).toContain('CRM');
		expect(text).toContain('$');
	});

	it('re-pulls the quote when the host fires refreshticker', async () => {
		const view = stubView({ recordId: '001', name: 'Acme', tickerSymbol: 'CRM' });
		(getViewSDK as Mock).mockResolvedValue(view);
		const fixture = await render();

		view.fire('refreshticker');
		await flush(fixture);
		expect(fixture.nativeElement.textContent).toContain('1 refresh received');
	});

	it('prompts to connect when no record is present', async () => {
		(getViewSDK as Mock).mockResolvedValue(stubView({}));
		expect((await render()).nativeElement.textContent).toContain('Drop this component');
	});
});
